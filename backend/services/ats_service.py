import os
import re
import warnings
warnings.filterwarnings("ignore")

import joblib
from scipy.sparse import hstack

# Singleton model loader
_ats_bundle = None

def get_ats_bundle():
    global _ats_bundle
    if _ats_bundle is not None:
        return _ats_bundle

    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ats_model.joblib")
    if not os.path.exists(model_path):
        print(f"[ATS Service] Model file not found at {model_path}. ML features will use fallback.")
        return None

    try:
        _ats_bundle = joblib.load(model_path)
        print("[ATS Service] ML model loaded successfully.")
        return _ats_bundle
    except Exception as e:
        print(f"[ATS Service] Error loading ML model: {e}")
        return None


def predict_ats_match_score(resume_text: str, job_description: str) -> dict:
    """
    Predicts the ATS compatibility score between a resume and job description
    using the trained TF-IDF + Ridge Regression ML model.
    
    If model is not found/loaded, uses a fallback keyword-overlap score.
    """
    bundle = get_ats_bundle()
    
    if not resume_text.strip() or not job_description.strip():
        return {
            "score": 0.0,
            "label": "No Fit",
            "ai_powered": False,
            "error": "Resume text and job description cannot be empty."
        }
        
    if bundle is None:
        # Simple text similarity fallback
        return fallback_predict_score(resume_text, job_description)

    try:
        model = bundle["model"]
        resume_vec = bundle["resume_vectorizer"]
        job_vec = bundle["job_vectorizer"]
        
        # Preprocess input (strip whitespace)
        resume_text_clean = resume_text.strip()
        job_description_clean = job_description.strip()
        
        # Vectorize
        X_resume = resume_vec.transform([resume_text_clean])
        X_job = job_vec.transform([job_description_clean])
        
        # Combine
        X = hstack([X_resume, X_job], format="csr")
        
        # Predict
        raw_score = float(model.predict(X)[0])
        score = float(max(10.0, min(100.0, raw_score)))
        
        # Categorize score
        if score < 40.0:
            label = "No Fit"
        elif score < 70.0:
            label = "Potential Fit"
        else:
            label = "Good Fit"
            
        return {
            "score": round(score, 1),
            "label": label,
            "ai_powered": True
        }
    except Exception as e:
        print(f"[ATS Service] Prediction failed: {e}")
        return fallback_predict_score(resume_text, job_description)


def fallback_predict_score(resume_text: str, job_description: str) -> dict:
    """Fallback text similarity score when the model is not trained/available."""
    resume_lower = resume_text.lower()
    job_lower = job_description.lower()
    
    # Extract alpha-numeric words
    r_words = set(re.findall(r'\b\w{3,}\b', resume_lower))
    j_words = set(re.findall(r'\b\w{3,}\b', job_lower))
    
    if not j_words:
        return {"score": 25.0, "label": "No Fit", "ai_powered": False}
        
    overlap = r_words.intersection(j_words)
    
    # Keyword match score formula
    match_ratio = len(overlap) / len(j_words)
    score = min(100.0, 20.0 + (match_ratio * 120.0))
    
    if score < 40.0:
        label = "No Fit"
    elif score < 70.0:
        label = "Potential Fit"
    else:
        label = "Good Fit"
        
    return {
        "score": round(score, 1),
        "label": label,
        "ai_powered": False
    }
