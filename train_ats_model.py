"""
ATS Score Prediction Model Training Script
==========================================
Trains a TF-IDF + Ridge Regression model on resume-job description pairs
from ats_dataset.csv and saves the trained model to backend/ats_model.joblib.

Usage:
    python train_ats_model.py
"""

import os
import sys
import time
import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
from scipy.sparse import hstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from scipy.stats import pearsonr
import joblib

# ─── Config ───────────────────────────────────────────────────────────────────
DATASET_PATH = os.path.join(os.path.dirname(__file__), "ats_dataset.csv")
OUTPUT_PATH  = os.path.join(os.path.dirname(__file__), "backend", "ats_model.joblib")
SEP_TOKEN    = " SEP "          # separator between resume and job description
MAX_FEATURES = 20_000           # TF-IDF vocabulary size per vectorizer
RANDOM_SEED  = 42
# ──────────────────────────────────────────────────────────────────────────────


def load_and_split(path: str):
    """Load CSV and split the combined text into resume and job description."""
    print(f"[1/5] Loading dataset from {path} ...")
    df = pd.read_csv(path)
    print(f"      Loaded {len(df):,} rows  |  columns: {list(df.columns)}")

    # Split on ' SEP ' separator
    splits = df["text"].str.split(SEP_TOKEN, n=1, expand=True)
    df["resume"] = splits[0].fillna("").str.strip()
    df["job"]    = splits[1].fillna("").str.strip()

    # Sanity: how many rows have both sides
    valid = (df["resume"].str.len() > 10) & (df["job"].str.len() > 10)
    print(f"      Valid pairs (both sides non-empty): {valid.sum():,}")
    df = df[valid].reset_index(drop=True)

    scores = df["ats_score"].values.astype(float)
    print(f"      Score range: {scores.min():.1f} – {scores.max():.1f}  "
          f"| mean: {scores.mean():.1f}  | median: {np.median(scores):.1f}")
    return df, scores


def build_features(df, resume_vec=None, job_vec=None, fit=True):
    """Vectorize resume and job text, return sparse feature matrix."""
    if fit:
        print("[2/5] Fitting TF-IDF vectorizers ...")
        resume_vec = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=MAX_FEATURES,
            sublinear_tf=True,
            min_df=2,
            strip_accents="unicode",
            analyzer="word",
            token_pattern=r"(?u)\b\w+\b",
        )
        job_vec = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=MAX_FEATURES,
            sublinear_tf=True,
            min_df=2,
            strip_accents="unicode",
            analyzer="word",
            token_pattern=r"(?u)\b\w+\b",
        )
        X_resume = resume_vec.fit_transform(df["resume"])
        X_job    = job_vec.fit_transform(df["job"])
    else:
        X_resume = resume_vec.transform(df["resume"])
        X_job    = job_vec.transform(df["job"])

    X = hstack([X_resume, X_job], format="csr")
    print(f"      Feature matrix shape: {X.shape}")
    return X, resume_vec, job_vec


def train_model(X_train, y_train):
    print("[3/5] Training Ridge Regression model ...")
    t0 = time.time()
    model = Ridge(alpha=10.0, max_iter=1000)
    model.fit(X_train, y_train)
    print(f"      Done in {time.time() - t0:.1f}s")
    return model


def evaluate(model, X_val, y_val):
    print("[4/5] Evaluating on validation set ...")
    preds = model.predict(X_val)
    # Clamp predictions to valid range
    preds = np.clip(preds, 0, 100)

    rmse = np.sqrt(mean_squared_error(y_val, preds))
    r2   = r2_score(y_val, preds)
    mae  = np.mean(np.abs(preds - y_val))
    pearson_r, _ = pearsonr(y_val, preds)

    print(f"      RMSE            : {rmse:.2f}")
    print(f"      MAE             : {mae:.2f}")
    print(f"      R²              : {r2:.4f}")
    print(f"      Pearson r       : {pearson_r:.4f}")

    # Label accuracy (No Fit / Potential Fit / Good Fit)
    def label(s):
        if s < 40: return "No Fit"
        if s < 70: return "Potential Fit"
        return "Good Fit"

    true_labels = [label(s) for s in y_val]
    pred_labels = [label(s) for s in preds]
    acc = sum(t == p for t, p in zip(true_labels, pred_labels)) / len(true_labels)
    print(f"      Label accuracy  : {acc*100:.1f}%")

    return {"rmse": rmse, "mae": mae, "r2": r2, "pearson": pearson_r, "label_acc": acc}


def save_model(model, resume_vec, job_vec, metrics, output_path):
    print(f"[5/5] Saving model to {output_path} ...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    bundle = {
        "model": model,
        "resume_vectorizer": resume_vec,
        "job_vectorizer": job_vec,
        "metrics": metrics,
        "sep_token": SEP_TOKEN,
        "version": "1.0",
    }
    joblib.dump(bundle, output_path, compress=3)
    size_mb = os.path.getsize(output_path) / 1024 / 1024
    print(f"      Saved ({size_mb:.1f} MB)")


def main():
    print("=" * 60)
    print("  ATS Score Model Training")
    print("=" * 60)

    # Load data
    df, scores = load_and_split(DATASET_PATH)

    # Train/val split (80/20)
    idx = np.arange(len(df))
    train_idx, val_idx = train_test_split(idx, test_size=0.2, random_state=RANDOM_SEED)
    df_train, df_val   = df.iloc[train_idx], df.iloc[val_idx]
    y_train, y_val     = scores[train_idx], scores[val_idx]

    print(f"      Train: {len(df_train):,}  |  Val: {len(df_val):,}")

    # Build features
    X_train, resume_vec, job_vec = build_features(df_train, fit=True)
    X_val, _, _                  = build_features(df_val, resume_vec, job_vec, fit=False)

    # Train
    model = train_model(X_train, y_train)

    # Evaluate
    metrics = evaluate(model, X_val, y_val)

    # Save
    save_model(model, resume_vec, job_vec, metrics, OUTPUT_PATH)

    print("\n[OK] Training complete!")
    print(f"   Model saved to: {OUTPUT_PATH}")
    print(f"   RMSE={metrics['rmse']:.2f}  R2={metrics['r2']:.4f}  Pearson={metrics['pearson']:.4f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
