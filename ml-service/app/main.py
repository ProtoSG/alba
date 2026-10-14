import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

MODEL_DIR = Path(os.getenv("MODEL_DIR", Path(__file__).resolve().parent.parent / "model"))
state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    state["model"] = joblib.load(MODEL_DIR / "model.joblib")
    state["meta"] = json.loads((MODEL_DIR / "model_meta.json").read_text())
    yield
    state.clear()


app = FastAPI(title="Alba ML service", version="0.1.0", lifespan=lifespan)

Item = Field(ge=0, le=3)


class PredictRequest(BaseModel):
    phq1: int = Item
    phq2: int = Item
    phq3: int = Item
    phq4: int = Item
    phq5: int = Item
    phq6: int = Item
    phq7: int = Item
    phq8: int = Item
    phq9: int = Item
    age: int = Field(ge=15, le=80)
    sex: Literal["F", "M"]
    semester: int = Field(ge=1, le=14)
    sleep_hours: float = Field(ge=0, le=24)
    weekly_study_hours: float = Field(ge=0, le=100)
    works_part_time: bool
    lives_with_family: bool


class PredictResponse(BaseModel):
    risk_level: Literal["low", "moderate", "high"]
    probabilities: dict[str, float]
    model: str


@app.get("/health")
def health():
    return {"status": "ok", "model": state["meta"]["model_name"]}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    meta = state.get("meta")
    if meta is None:
        raise HTTPException(503, "model not loaded")
    row = req.model_dump()
    row["sex_male"] = int(row.pop("sex") == "M")
    row["works_part_time"] = int(row["works_part_time"])
    row["lives_with_family"] = int(row["lives_with_family"])
    X = pd.DataFrame([row])[meta["features"]]
    proba = state["model"].predict_proba(X)[0]
    probs = {c: round(float(p), 4) for c, p in zip(meta["classes"], proba)}
    return PredictResponse(
        risk_level=max(probs, key=probs.get), probabilities=probs, model=meta["model_name"])
