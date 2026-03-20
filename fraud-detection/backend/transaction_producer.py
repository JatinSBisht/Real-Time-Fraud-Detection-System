import json
import time
import random
from datetime import datetime
import uuid
import logging
import queue
import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TransactionProducer:
    def __init__(self, transaction_queue):
        self.queue = transaction_queue
        self.running = False
        self.thread = None

    def generate_transaction(self):
        countries = ['US', 'UK', 'CA', 'AU', 'IN', 'SG', 'JP', 'CN', 'BR', 'MX']
        merchants = ['Amazon', 'Walmart', 'Target', 'BestBuy', 'Apple', 'Nike', 'Starbucks', 'McDonald', 'Tesla', 'Netflix']
        
        # Generate transaction with varying amounts
        # 15% chance of high-risk transaction (>3000)
        if random.random() < 0.15:
            amount = round(random.uniform(3000, 10000), 2)
        else:
            amount = round(random.uniform(10, 2999), 2)
        
        transaction = {
            'transaction_id': str(uuid.uuid4()),
            'amount': amount,
            'country': random.choice(countries),
            'merchant': random.choice(merchants),
            'timestamp': datetime.utcnow().isoformat()
        }
        return transaction

    def send_transaction(self, transaction=None):
        if transaction is None:
            transaction = self.generate_transaction()
        
        try:
            self.queue.put(transaction)
            logger.info(f"Sent transaction: {transaction['transaction_id']} - ${transaction['amount']}")
            return transaction
        except Exception as e:
            logger.error(f"Failed to send transaction: {e}")
            return None

    def start_continuous(self, interval=3):
        """Start producing transactions continuously"""
        self.running = True
        
        def produce():
            while self.running:
                self.send_transaction()
                time.sleep(interval)
        
        self.thread = threading.Thread(target=produce, daemon=True)
        self.thread.start()
        logger.info(f"Producer started, generating transactions every {interval} seconds")
    
    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("Producer stopped")
