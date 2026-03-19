import os
import sys
import json
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from kafka import KafkaConsumer
from ml_fraud_detector import MLFraudDetector
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FraudDetectionConsumer:
    def __init__(self, mongo_url, db_name):
        self.mongo_url = mongo_url
        self.db_name = db_name
        self.detector = MLFraudDetector()
        self.client = None
        self.db = None
        self.consumer = None
        
    async def connect_db(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        logger.info("Connected to MongoDB")
    
    def connect_kafka(self, bootstrap_servers='localhost:9092', topic='transactions'):
        """Connect to Kafka"""
        try:
            self.consumer = KafkaConsumer(
                topic,
                bootstrap_servers=bootstrap_servers,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                auto_offset_reset='latest',
                enable_auto_commit=True,
                api_version=(2, 5, 0)
            )
            logger.info(f"Kafka Consumer connected to {bootstrap_servers}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            return False
    
    async def process_transaction(self, transaction):
        """Process single transaction with fraud detection"""
        # Analyze with ML model
        fraud_result = self.detector.analyze_transaction(transaction)
        
        # Enrich transaction
        transaction['is_fraud'] = fraud_result['is_fraud']
        transaction['risk_score'] = fraud_result['risk_score']
        transaction['fraud_risk'] = 'HIGH' if fraud_result['risk_score'] > 0.7 else 'MEDIUM' if fraud_result['risk_score'] > 0.4 else 'LOW'
        
        # Store in MongoDB
        try:
            await self.db.transactions.insert_one(transaction)
            logger.info(f"Processed: {transaction['transaction_id']} - Risk: {transaction['fraud_risk']} ({fraud_result['risk_score']})")
        except Exception as e:
            logger.error(f"Failed to store transaction: {e}")
        
        return transaction
    
    async def consume_messages(self):
        """Consume messages from Kafka"""
        if not self.consumer:
            logger.error("Consumer not initialized")
            return
        
        logger.info("Starting to consume messages...")
        
        for message in self.consumer:
            try:
                transaction = message.value
                await self.process_transaction(transaction)
            except Exception as e:
                logger.error(f"Error processing message: {e}")
    
    def run(self):
        """Run the consumer"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        loop.run_until_complete(self.connect_db())
        
        if self.connect_kafka():
            loop.run_until_complete(self.consume_messages())
        
        loop.close()

if __name__ == "__main__":
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    consumer = FraudDetectionConsumer(mongo_url, db_name)
    
    try:
        consumer.run()
    except KeyboardInterrupt:
        logger.info("Stopping consumer...")
