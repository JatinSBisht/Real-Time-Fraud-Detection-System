# 🚀 Real-Time Fraud Detection System

## 📌 Overview
This project simulates a real-time fraud detection system using streaming data.

## ⚙️ Tech Stack
- Apache Kafka
- Python
- Docker

## 🧠 Architecture
Producer → Kafka → Consumer → Fraud Detection

## 🔥 Features
- Real-time transaction streaming
- Rule-based fraud detection
- Continuous data processing

## ▶️ How to Run

1. Start Kafka:
   docker-compose up

2. Run Producer:
   python producer.py

3. Run Consumer:
   python consumer.py

## 📊 Sample Output
Transaction: {'amount': 4500, 'country': 'US'} → FRAUD
