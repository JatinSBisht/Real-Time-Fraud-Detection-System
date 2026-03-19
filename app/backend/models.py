from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
import uuid

class Transaction(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    
    transaction_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float
    country: str
    merchant: str
    timestamp: str
    fraud_risk: Optional[str] = None
    is_fraud: Optional[bool] = None
    risk_score: Optional[float] = None

class TransactionCreate(BaseModel):
    amount: float
    country: str
    merchant: str

class SystemStatus(BaseModel):
    kafka_connected: bool
    spark_running: bool
    total_transactions: int
    fraud_detected: int
    last_updated: str
