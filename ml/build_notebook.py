"""Build benchmark.ipynb (self-contained, Colab-ready) programmatically."""
import inspect
import nbformat as nbf
import generate_dataset as g

md, code = nbf.v4.new_markdown_cell, nbf.v4.new_code_cell
gen_src = inspect.getsource(g.generate)

cells = [
md("""# PHQ-9 risk benchmark: Logistic Regression vs Random Forest vs XGBoost

**WARNING: the data is SYNTHETIC. Results are NOT clinically valid.**
Upload `dataset.csv` to the working directory (Colab: Files panel). If missing, it is generated inline."""),
code("""import importlib.util, subprocess, sys
if importlib.util.find_spec("xgboost") is None:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "xgboost"])"""),
code("""import os
import numpy as np, pandas as pd, matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             recall_score, roc_auc_score)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

SEED = 42
ITEM_COLS = [f"phq{i}" for i in range(1, 10)]
FEATURES = ITEM_COLS + ["age", "sex_male", "semester", "sleep_hours",
                        "weekly_study_hours", "works_part_time", "lives_with_family"]
CLASSES = ["low", "moderate", "high"]
NOISE_SD, THRESHOLDS = 3.0, (9.0, 15.0)"""),
code("# Inline fallback generator (same as generate_dataset.py)\n" + gen_src),
code("""if os.path.exists("dataset.csv"):
    df = pd.read_csv("dataset.csv"); print("loaded dataset.csv")
else:
    df = generate(2000, SEED); print("dataset.csv not found: generated inline")
print(df.shape); df["risk_level"].value_counts(normalize=True).round(3)"""),
code("""X = df[FEATURES]
y = df["risk_level"].map({c: i for i, c in enumerate(CLASSES)}).values
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=SEED)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
models = {
    "LogisticRegression": make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000, random_state=SEED)),
    "RandomForest": RandomForestClassifier(n_estimators=300, min_samples_leaf=3, random_state=SEED, n_jobs=-1),
    "XGBoost": XGBClassifier(n_estimators=250, max_depth=3, learning_rate=0.08, subsample=0.9,
                             colsample_bytree=0.9, objective="multi:softprob",
                             eval_metric="mlogloss", random_state=SEED, n_jobs=1),
}
high = CLASSES.index("high")
rows, cms = [], {}
for name, m in models.items():
    cvr = cross_validate(m, X_tr, y_tr, cv=cv, scoring={"f1": "f1_macro"})
    m.fit(X_tr, y_tr)
    proba = m.predict_proba(X_te); pred = proba.argmax(1)
    rows.append({"model": name,
        "cv_f1_macro": cvr["test_f1"].mean(),
        "accuracy": accuracy_score(y_te, pred),
        "f1_macro": f1_score(y_te, pred, average="macro"),
        "auc_macro_ovr": roc_auc_score(y_te, proba, multi_class="ovr", average="macro"),
        "recall_high": recall_score(y_te, pred, labels=[high], average="macro")})
    cms[name] = confusion_matrix(y_te, pred, labels=[0, 1, 2])
res = pd.DataFrame(rows).set_index("model").round(3)
res"""),
code("""winner = res.sort_values(["f1_macro", "auc_macro_ovr"], ascending=False).index[0]
print("Winner (macro F1, tie-break AUC):", winner)
res[["accuracy", "f1_macro", "auc_macro_ovr", "recall_high"]].plot.bar(figsize=(8, 4), ylim=(0, 1))
plt.title("Test-set metrics (synthetic data)"); plt.show()"""),
code("""fig, axes = plt.subplots(1, 3, figsize=(12, 3.5))
for ax, (name, cm) in zip(axes, cms.items()):
    ax.imshow(cm, cmap="Blues"); ax.set_title(name)
    ax.set_xticks(range(3), CLASSES); ax.set_yticks(range(3), CLASSES)
    ax.set_xlabel("predicted"); ax.set_ylabel("true")
    for (i, j), v in np.ndenumerate(cm): ax.text(j, i, int(v), ha="center", va="center")
plt.tight_layout(); plt.show()"""),
]
nb = nbf.v4.new_notebook(cells=cells)
nbf.write(nb, "benchmark.ipynb")
print("wrote benchmark.ipynb")
