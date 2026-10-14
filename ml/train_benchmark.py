"""Benchmark Logistic Regression, Random Forest and XGBoost on the synthetic dataset."""
from __future__ import annotations

import json
from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             recall_score, roc_auc_score)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

from generate_dataset import CLASSES, FEATURES, generate

SEED = 42
ROOT = Path(__file__).parent
RESULTS = ROOT / "results"
MODEL_DIR = ROOT / "model"
DATASET = ROOT.parent / "dataset.csv"  # shared at mvp root (also used by Colab)


def build_models() -> dict:
    return {
        "LogisticRegression": make_pipeline(
            StandardScaler(), LogisticRegression(max_iter=2000, random_state=SEED)),
        "RandomForest": RandomForestClassifier(
            n_estimators=300, min_samples_leaf=3, random_state=SEED, n_jobs=-1),
        "XGBoost": XGBClassifier(
            n_estimators=250, max_depth=3, learning_rate=0.08, subsample=0.9,
            colsample_bytree=0.9, objective="multi:softprob",
            eval_metric="mlogloss", random_state=SEED, n_jobs=1),
    }


def main() -> None:
    RESULTS.mkdir(exist_ok=True)
    MODEL_DIR.mkdir(exist_ok=True)
    if DATASET.exists():
        df = pd.read_csv(DATASET)
    else:
        df = generate(2000, SEED)
        df.to_csv(DATASET, index=False)
    df.to_csv(ROOT / "data_synthetic_phq9.csv", index=False) if False else None
    X = df[FEATURES]
    y = df["risk_level"].map({c: i for i, c in enumerate(CLASSES)}).values

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=SEED)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
    scoring = {"accuracy": "accuracy", "f1_macro": "f1_macro",
               "auc_macro": "roc_auc_ovr"}
    high = CLASSES.index("high")

    metrics: dict = {"n_rows": len(df), "seed": SEED, "classes": CLASSES, "models": {}}
    fitted = {}
    for name, model in build_models().items():
        cvr = cross_validate(model, X_tr, y_tr, cv=cv, scoring=scoring)
        model.fit(X_tr, y_tr)
        proba = model.predict_proba(X_te)
        pred = proba.argmax(axis=1)
        metrics["models"][name] = {
            "cv_5fold": {k: {"mean": float(np.mean(cvr[f"test_{k}"])),
                             "std": float(np.std(cvr[f"test_{k}"]))} for k in scoring},
            "test": {
                "accuracy": float(accuracy_score(y_te, pred)),
                "f1_macro": float(f1_score(y_te, pred, average="macro")),
                "auc_macro_ovr": float(roc_auc_score(y_te, proba, multi_class="ovr", average="macro")),
                "recall_high": float(recall_score(y_te, pred, labels=[high], average="macro")),
            },
            "confusion_matrix": confusion_matrix(y_te, pred, labels=[0, 1, 2]).tolist(),
        }
        fitted[name] = model

    winner = max(metrics["models"], key=lambda n: (
        round(metrics["models"][n]["test"]["f1_macro"], 4),
        metrics["models"][n]["test"]["auc_macro_ovr"]))
    metrics["winner"] = winner
    (RESULTS / "metrics.json").write_text(json.dumps(metrics, indent=2))

    # Comparison plot: metrics bars + winner confusion matrix
    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))
    names = list(metrics["models"])
    keys = ["accuracy", "f1_macro", "auc_macro_ovr", "recall_high"]
    w = 0.2
    for i, k in enumerate(keys):
        vals = [metrics["models"][n]["test"][k] for n in names]
        axes[0].bar(np.arange(len(names)) + i * w, vals, w, label=k)
    axes[0].set_xticks(np.arange(len(names)) + 1.5 * w, names)
    axes[0].set_ylim(0, 1)
    axes[0].set_title("Test-set metrics (synthetic data)")
    axes[0].legend(loc="lower right", fontsize=8)
    cm = np.array(metrics["models"][winner]["confusion_matrix"])
    axes[1].imshow(cm, cmap="Blues")
    axes[1].set_xticks(range(3), CLASSES)
    axes[1].set_yticks(range(3), CLASSES)
    axes[1].set_xlabel("predicted")
    axes[1].set_ylabel("true")
    axes[1].set_title(f"Confusion matrix - {winner}")
    for (i, j), v in np.ndenumerate(cm):
        axes[1].text(j, i, int(v), ha="center", va="center")
    fig.tight_layout()
    fig.savefig(RESULTS / "comparison.png", dpi=130)

    # Refit winner on all data for export
    final = build_models()[winner].fit(X, y)
    joblib.dump(final, MODEL_DIR / "model.joblib")
    meta = {
        "model_name": winner,
        "features": FEATURES,
        "classes": CLASSES,
        "metrics": metrics["models"][winner]["test"],
        "synthetic_data": True,
        "disclaimer": "Trained on synthetic data. Not clinically valid.",
    }
    (MODEL_DIR / "model_meta.json").write_text(json.dumps(meta, indent=2))

    print(f"{'model':20s} {'acc':>6s} {'f1m':>6s} {'auc':>6s} {'rec_high':>9s}")
    for n in names:
        t = metrics["models"][n]["test"]
        print(f"{n:20s} {t['accuracy']:6.3f} {t['f1_macro']:6.3f} "
              f"{t['auc_macro_ovr']:6.3f} {t['recall_high']:9.3f}")
    print("CV f1_macro:", {n: round(metrics['models'][n]['cv_5fold']['f1_macro']['mean'], 3) for n in names})
    print("winner:", winner)


if __name__ == "__main__":
    main()
