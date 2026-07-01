from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import os

app = FastAPI(title="UPI Fraud Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model     = joblib.load(os.path.join(BASE_DIR, '..', 'model', 'fraud_model.pkl'))
explainer = joblib.load(os.path.join(BASE_DIR, '..', 'model', 'shap_explainer.pkl'))

FEATURE_NAMES = (
    [f'V{i}' for i in range(1, 29)] +
    ['hour', 'is_night', 'Amount_scaled']
)

# Human readable mapping for top features
FEATURE_DESCRIPTIONS = {
    'V14': 'unusual account behavior',
    'V4':  'suspicious transaction pattern',
    'V1':  'abnormal activity signal',
    'V8':  'irregular transaction behavior',
    'V12': 'unusual spending pattern',
    'V10': 'abnormal account signal',
    'hour': 'transaction at unusual hour',
    'is_night': 'late night transaction',
    'Amount_scaled': 'unusual transaction amount',
    'V17': 'suspicious behavioral signal',
    'V3':  'irregular account pattern',
    'V7':  'abnormal transaction signal',
}

class Transaction(BaseModel):
    features: list[float]

@app.get("/")
def home():
    return {
        "message": "UPI Fraud Detection API is running",
        "status": "healthy"
    }

@app.post("/predict")
def predict(txn: Transaction):
    X = np.array(txn.features).reshape(1, -1)

    # Fraud probability
    prob  = model.predict_proba(X)[0][1]
    label = int(prob >= 0.5)

    # SHAP values
    shap_vals = explainer.shap_values(X)[0]
    feature_shap = dict(zip(FEATURE_NAMES, shap_vals))

    # Top 3 features by absolute SHAP value
    top_3 = sorted(feature_shap.items(),
                   key=lambda x: abs(x[1]),
                   reverse=True)[:3]

    # Convert to human readable reasons
    reasons = [
        FEATURE_DESCRIPTIONS.get(f, f"suspicious signal in {f}")
        for f, v in top_3 if v > 0  # only features pushing toward fraud
    ]

    # Build customer friendly explanation
    if label == 1:
        if reasons:
            explanation = f"Transaction flagged due to: {', '.join(reasons)}."
        else:
            explanation = "Transaction flagged due to suspicious activity."
    else:
        explanation = "Transaction appears legitimate."

    return {
        "fraud_probability": round(float(prob), 4),
        "is_fraud": label,
        "risk_level": "HIGH" if prob >= 0.7 else "MEDIUM" if prob >= 0.4 else "LOW",
        "message": "Fraudulent transaction detected" if label == 1 else "Legitimate transaction",
        "explanation": explanation
    }