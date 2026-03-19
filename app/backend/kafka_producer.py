import json
import time
import random
from kafka import KafkaProducer
from datetime import datetime
import uuid
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TransactionProducer:
    def __init__(self, bootstrap_servers='localhost:9092', topic='transactions'):
        self.topic = topic
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                api_version=(2, 5, 0)
            )
            logger.info(f"Kafka Producer connected to {bootstrap_servers}")
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            self.producer = None

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
        if not self.producer:
            logger.error("Producer not initialized")
            return None
        
        if transaction is None:
            transaction = self.generate_transaction()
        
        try:
            future = self.producer.send(self.topic, transaction)
            future.get(timeout=10)
            logger.info(f"Sent transaction: {transaction['transaction_id']} - ${transaction['amount']}")
            return transaction
        except Exception as e:
            logger.error(f"Failed to send transaction: {e}")
            return None

    def produce_continuous(self, interval=2, count=None):
        """Produce transactions continuously"""
        produced = 0
        while True:
            if count and produced >= count:
                break
            
            self.send_transaction()
            produced += 1
            time.sleep(interval)

    def close(self):
        if self.producer:
            self.producer.close()
            logger.info("Producer closed")

if __name__ == "__main__":
    producer = TransactionProducer()
    try:
        # Produce transactions every 2 seconds
        producer.produce_continuous(interval=2)
    except KeyboardInterrupt:
        logger.info("Stopping producer...")
        producer.close()
