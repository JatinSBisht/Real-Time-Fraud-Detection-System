import numpy as np
from sklearn.ensemble import IsolationForest
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLFraudDetector:
    def __init__(self):
        # Initialize Isolation Forest for anomaly detection
        self.model = IsolationForest(
            contamination=0.15,  # Expected 15% fraud rate
            random_state=42,
            n_estimators=100
        )
        self.is_trained = False
        self.training_data = []
        
    def extract_features(self, transaction):
        """Extract numerical features from transaction"""
        # Features: amount, country_code (hash), merchant_code (hash), hour of day
        try:
            from datetime import datetime
            timestamp = datetime.fromisoformat(transaction.get('timestamp', datetime.utcnow().isoformat()))
            hour = timestamp.hour
        except:
            hour = 12
        
        # Simple hash for country and merchant
        country_code = hash(transaction.get('country', 'US')) % 100
        merchant_code = hash(transaction.get('merchant', 'Unknown')) % 100
        
        features = [
            transaction.get('amount', 0),
            country_code,
            merchant_code,
            hour
        ]
        return features
    
    def train_initial(self, transactions):
        """Train model with initial data"""
        if len(transactions) < 10:
            logger.warning("Not enough data to train. Need at least 10 transactions.")
            return False
        
        features = [self.extract_features(t) for t in transactions]
        X = np.array(features)
        
        self.model.fit(X)
        self.is_trained = True
        logger.info(f"Model trained with {len(transactions)} transactions")
        return True
    
    def predict_fraud(self, transaction):
        """Predict if transaction is fraudulent"""
        features = self.extract_features(transaction)
        X = np.array([features])
        
        # Get prediction and anomaly score
        prediction = self.model.predict(X)[0]
        score = self.model.score_samples(X)[0]
        
        # -1 means anomaly (fraud), 1 means normal
        is_fraud = prediction == -1
        
        # Convert score to risk probability (0-1)
        # Isolation Forest scores are negative, lower is more anomalous
        risk_score = float(1 / (1 + np.exp(score * 10)))  # Sigmoid transformation
        
        return {
            'is_fraud': bool(is_fraud),
            'risk_score': round(risk_score, 4),
            'confidence': round(abs(score) * 10, 2)
        }
    
    def detect_with_rules(self, transaction):
        """Rule-based detection as fallback"""
        amount = transaction.get('amount', 0)
        country = transaction.get('country', '')
        
        # Simple rule-based logic
        risk_factors = 0
        risk_score = 0.0
        
        # Rule 1: High amount
        if amount > 5000:
            risk_factors += 3
            risk_score += 0.4
        elif amount > 3000:
            risk_factors += 2
            risk_score += 0.3
        elif amount > 2000:
            risk_factors += 1
            risk_score += 0.15
        
        # Rule 2: High-risk countries
        high_risk_countries = ['CN', 'BR', 'IN']
        if country in high_risk_countries:
            risk_factors += 1
            risk_score += 0.2
        
        is_fraud = risk_factors >= 2
        
        return {
            'is_fraud': is_fraud,
            'risk_score': min(risk_score, 0.99),
            'confidence': 0.7
        }
    
    def analyze_transaction(self, transaction):
        """Main method to analyze transaction"""
        if self.is_trained:
            result = self.predict_fraud(transaction)
        else:
            result = self.detect_with_rules(transaction)
            # Collect data for training
            self.training_data.append(transaction)
            if len(self.training_data) >= 50:
                self.train_initial(self.training_data)
        
        return result
