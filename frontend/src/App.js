import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://upi-fraud-api-o7or.onrender.com';

function App() {
  const [features, setFeatures] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const featuresArray = features.split(',').map(f => parseFloat(f.trim()));
      
      if (featuresArray.length !== 31) {
        setError(`Please enter exactly 31 features. You entered ${featuresArray.length}.`);
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_URL}/predict`, {
        features: featuresArray
      });

      setResult(response.data);
    } catch (err) {
      setError('Error connecting to API. Make sure the API is running.');
    }

    setLoading(false);
  };

  const getRiskColor = (risk) => {
    if (risk === 'HIGH') return '#ef4444';
    if (risk === 'MEDIUM') return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0d0d14', 
      color: '#e4e4f0',
      fontFamily: 'Segoe UI, sans-serif',
      padding: '40px 20px'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          UPI Fraud Detection
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>
          Enter transaction features to detect fraud in real time
        </p>
      </div>

      {/* Main Card */}
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: '#13131f',
        border: '1px solid #1e1e2e',
        borderRadius: '16px',
        padding: '32px'
      }}>

        <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#f9fafb' }}>
          Transaction Features
        </h2>
        
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '12px' }}>
          Enter 31 comma-separated values (V1-V28, hour, is_night, Amount_scaled)
        </p>

        <textarea
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          placeholder="-1.359, -0.072, 2.536, 1.378, -0.338, 0.462, 0.239, 0.098, 0.363, 0.090, -0.551, -0.617, -0.991, -0.311, 1.468, -0.470, 0.207, 0.025, 0.403, 0.251, -0.018, 0.277, -0.110, 0.066, 0.128, -0.189, 0.133, -0.021, 0.0, 149.62, 13.0"
          style={{
            width: '100%',
            height: '120px',
            background: '#0a0a12',
            border: '1px solid #2a2a3e',
            borderRadius: '10px',
            color: '#86efac',
            padding: '14px',
            fontSize: '13px',
            fontFamily: 'Courier New, monospace',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: '#fca5a5',
            fontSize: '13px',
            margin: '12px 0'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handlePredict}
          disabled={loading || !features}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#2a2a3e' : 'linear-gradient(135deg, #a78bfa, #f472b6)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '16px'
          }}
        >
          {loading ? 'Analyzing...' : 'Detect Fraud'}
        </button>

        {/* Result */}
        {result && (
          <div style={{
            marginTop: '24px',
            background: '#0a0a12',
            border: `1px solid ${getRiskColor(result.risk_level)}`,
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '16px',
              color: getRiskColor(result.risk_level)
            }}>
              {result.risk_level === 'HIGH' ? '🚨' : result.risk_level === 'MEDIUM' ? '⚠️' : '✅'} {result.message}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: getRiskColor(result.risk_level)
                }}>
                  {(result.fraud_probability * 100).toFixed(2)}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Fraud Probability
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: getRiskColor(result.risk_level)
                }}>
                  {result.risk_level}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Risk Level
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: getRiskColor(result.risk_level)
                }}>
                  {result.is_fraud === 1 ? 'FRAUD' : 'LEGIT'}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Verdict
                </div>
              </div>
            </div>

            {/* Explanation */}
            {result.explanation && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'rgba(167,139,250,0.08)',
                border: `1px solid rgba(167,139,250,0.25)`,
                borderRadius: '8px',
                fontSize: '14px',
                color: '#e4e4f0',
                textAlign: 'center',
                lineHeight: '1.6'
              }}>
                📋 {result.explanation}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '40px', color: '#374151', fontSize: '13px' }}>
        UPI Fraud Detection System · XGBoost Model · AUC-ROC 0.98
      </div>

    </div>
  );
}

export default App;