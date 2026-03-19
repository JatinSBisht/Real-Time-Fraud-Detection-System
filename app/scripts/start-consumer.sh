#!/bin/bash

echo "Starting Fraud Detection Consumer..."

cd /app/backend

# Activate virtual environment if exists
if [ -d "/root/.venv" ]; then
    source /root/.venv/bin/activate
fi

# Start the consumer in background
nohup python spark_consumer.py > /var/log/fraud_consumer.log 2>&1 &

echo "Consumer started! Check logs at /var/log/fraud_consumer.log"
