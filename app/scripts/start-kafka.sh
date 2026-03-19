#!/bin/bash

echo "Starting Kafka and Zookeeper with Docker Compose..."

cd /app

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose not found, trying docker compose..."
    docker compose up -d
else
    docker-compose up -d
fi

echo "Waiting for Kafka to be ready..."
sleep 10

echo "Creating Kafka topic 'transactions'..."
docker exec kafka kafka-topics --create --topic transactions --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1 --if-not-exists

echo "Kafka setup complete!"
echo "Kafka is running on localhost:9092"
