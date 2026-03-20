import asyncio
import logging
import queue
import threading
from motor.motor_asyncio import AsyncIOMotorClient
from ml_fraud_detector import MLFraudDetector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FraudDetectionConsumer:
    def __init__(self, transaction_queue, mongo_url, db_name, websocket_manager):
        self.queue = transaction_queue
        self.mongo_url = mongo_url
        self.db_name = db_name
        self.detector = MLFraudDetector()
        self.manager = websocket_manager
        self.client = None
        self.db = None
        self.running = False
        self.thread = None
        
    async def connect_db(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        logger.info("Consumer connected to MongoDB")
    
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
        
        # Broadcast to WebSocket clients
        await self.manager.broadcast({
            'type': 'new_transaction',
            'data': transaction
        })
        
        return transaction
    
    def start(self):
        """Start the consumer"""
        self.running = True
        
        def consume():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            loop.run_until_complete(self.connect_db())
            
            while self.running:
                try:
                    # Get transaction from queue with timeout
                    transaction = self.queue.get(timeout=1)
                    loop.run_until_complete(self.process_transaction(transaction))
                except queue.Empty:
                    continue
                except Exception as e:
                    logger.error(f"Error processing transaction: {e}")
            
            loop.close()
        
        self.thread = threading.Thread(target=consume, daemon=True)
        self.thread.start()
        logger.info("Consumer started")
    
    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        if self.client:
            self.client.close()
        logger.info("Consumer stopped")
