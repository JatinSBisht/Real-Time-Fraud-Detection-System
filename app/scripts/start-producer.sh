#!/bin/bash

echo "Starting Transaction Producer..."

cd /app/backend

# Activate virtual environment if exists
if [ -d "/root/.venv" ]; then
    source /root/.venv/bin/activate
fi

# Start the producer in background (generates 1 transaction every 3 seconds)
nohup python -c "
import time
from kafka_producer import TransactionProducer
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

producer = TransactionProducer()
logger.info('Producer started, generating transactions every 3 seconds...')

try:
    while True:
        producer.send_transaction()
        time.sleep(3)
except KeyboardInterrupt:
    logger.info('Stopping producer...')
    producer.close()
" > /var/log/fraud_producer.log 2>&1 &

echo "Producer started! Check logs at /var/log/fraud_producer.log"
