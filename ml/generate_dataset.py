"""Generate a SYNTHETIC dataset for PHQ-9 risk classification.

The data is NOT real and NOT clinically valid. Design:

1. Each student has a latent "true depressive burden" z (0..1 scale, skewed low).
2. PHQ-9 items are sampled around z (items correlated, item 9 rarer).
3. A latent severity score is built as:
       severity = PHQ9_sum + sleep/study/work/family contributions + N(0, sigma)
   so the label is NOT a pure function of the PHQ-9 sum (avoids trivial 100% models).
4. risk_level is obtained by thresholding the latent severity:
       low < 9 <= moderate < 15 <= high
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

ITEM_COLS = [f"phq{i}" for i in range(1, 10)]
FEATURES = ITEM_COLS + [
    "age", "sex_male", "semester", "sleep_hours",
    "weekly_study_hours", "works_part_time", "lives_with_family",
]
CLASSES = ["low", "moderate", "high"]
NOISE_SD = 3.0
THRESHOLDS = (9.0, 15.0)


def generate(n: int = 2000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    age = np.clip(rng.normal(21, 2.5, n).round(), 17, 35).astype(int)
    sex_male = rng.binomial(1, 0.45, n)
    semester = np.clip(rng.integers(1, 11, n), 1, 10)
    sleep_hours = np.clip(rng.normal(6.6, 1.2, n), 3, 10).round(1)
    study_hours = np.clip(rng.normal(18, 8, n), 0, 50).round(1)
    works = rng.binomial(1, 0.35, n)
    family = rng.binomial(1, 0.7, n)

    # Latent depressive burden, mildly influenced by context.
    base = rng.beta(1.6, 3.2, n)
    base += 0.05 * (works) + 0.04 * (1 - family) + 0.03 * (6.5 - sleep_hours) / 2
    base = np.clip(base, 0, 1)

    items = np.zeros((n, 9), dtype=int)
    item_weight = np.array([1.0, 1.0, 1.1, 1.1, 0.9, 0.9, 0.9, 0.7, 0.35])
    for j in range(9):
        p = np.clip(base * item_weight[j] * 0.9 + rng.normal(0, 0.08, n), 0, 1)
        items[:, j] = rng.binomial(3, p)
    phq_sum = items.sum(axis=1)

    context = (
        0.8 * (7.0 - sleep_hours)
        + 0.06 * (study_hours - 18)
        + 1.0 * works
        + 1.2 * (1 - family)
        + 0.15 * (semester - 5)
    )
    severity = phq_sum + context + rng.normal(0, NOISE_SD, n)
    risk = np.where(severity < THRESHOLDS[0], "low",
                    np.where(severity < THRESHOLDS[1], "moderate", "high"))

    df = pd.DataFrame(items, columns=ITEM_COLS)
    df["age"] = age
    df["sex_male"] = sex_male
    df["semester"] = semester
    df["sleep_hours"] = sleep_hours
    df["weekly_study_hours"] = study_hours
    df["works_part_time"] = works
    df["lives_with_family"] = family
    df["risk_level"] = risk
    return df


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=2000)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--out", type=Path, default=Path(__file__).resolve().parent.parent / "dataset.csv")
    a = ap.parse_args()
    a.out.parent.mkdir(parents=True, exist_ok=True)
    d = generate(a.n, a.seed)
    d.to_csv(a.out, index=False)
    print(f"wrote {len(d)} rows to {a.out}")
    print(d["risk_level"].value_counts(normalize=True).round(3).to_string())
    print("PHQ-9 sum mean:", d[ITEM_COLS].sum(axis=1).mean().round(2))
