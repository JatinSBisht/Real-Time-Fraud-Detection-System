Now let me create a README with setup instructions and start the services:
Action: file_editor create /app/README.md --file-text "# Sentinel - Real-Time Fraud Detection System

A production-ready fraud detection system using Kafka, Spark Streaming, and Machine Learning for real-time transaction monitoring.

## 🏗️ Architecture

```
Transaction Producer → Kafka → Spark Consumer (ML Detection) → MongoDB → WebSocket → React Dashboard
```

### Components:
1. **Kafka**: Message broker for real-time data streaming
2. **Spark Streaming**: Processes transactions in real-time
3. **ML Fraud Detector**: Isolation Forest algorithm for anomaly detection
4. **FastAPI Backend**: REST API + WebSocket for real-time updates
5. **React Dashboard**: Live monitoring interface
6. **MongoDB**: Transaction storage

## 🚀 Quick Start

### 1. Start Kafka & Zookeeper
```bash
bash /app/scripts/start-kafka.sh
```

### 2. Start Backend Services
The FastAPI backend with WebSocket is already running via supervisor.

### 3. Start Consumer (Fraud Detection Engine)
```bash
bash /app/scripts/start-consumer.sh
```

### 4. Start Producer (Optional - for continuous data)
```bash
bash /app/scripts/start-producer.sh
```

### 5. Access Dashboard
Frontend is already running. Open your browser to view the dashboard.

## 🧠 ML Fraud Detection

### Algorithm: Isolation Forest
- **Purpose**: Unsupervised anomaly detection
- **Contamination Rate**: 15% (expected fraud percentage)
- **Features Used**:
  - Transaction amount
  - Country code (hashed)
  - Merchant code (hashed)
  - Hour of day

### How It Works:
1. **Training Phase**: Collects first 50 transactions to train the model
2. **Detection Phase**: Analyzes each transaction for anomalies
3. **Risk Scoring**: Outputs fraud probability (0-1)
4. **Classification**:
   - HIGH: Risk score > 0.7
   - MEDIUM: Risk score 0.4-0.7
   - LOW: Risk score < 0.4

### Fallback Rules (Before ML Training):
- Amount > $5000 → High Risk
- Amount > $3000 → Medium Risk
- High-risk countries → Additional risk factor

## 📊 API Endpoints

### Get Transactions
```bash
curl ${REACT_APP_BACKEND_URL}/api/transactions?limit=50
```

### Get Statistics
```bash
curl ${REACT_APP_BACKEND_URL}/api/stats
```

### Generate Test Transactions
```bash
curl -X POST ${REACT_APP_BACKEND_URL}/api/generate-transactions?count=10
```

### System Status
```bash
curl ${REACT_APP_BACKEND_URL}/api/system-status
```

### WebSocket (Real-time Updates)
```javascript
const ws = new WebSocket('wss://your-domain/api/ws');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('New transaction:', message.data);
};
```

## 🔧 Tech Stack

### Backend:
- **FastAPI** - Web framework
- **Motor** - Async MongoDB driver
- **Kafka-Python** - Kafka client
- **PySpark** - Distributed processing
- **Scikit-learn** - ML library
- **WebSockets** - Real-time communication

### Frontend:
- **React 19** - UI framework
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Shadcn/UI** - Component library
- **Tailwind CSS** - Styling

### Infrastructure:
- **Docker** - Kafka + Zookeeper containerization
- **MongoDB** - Database
- **Supervisor** - Process management

## 📈 Features

### Dashboard:
✅ Real-time transaction feed
✅ Live fraud detection alerts
✅ System health monitoring
✅ Fraud rate analytics
✅ WebSocket-powered updates
✅ ML-based risk scoring
✅ Beautiful dark mode UI

### Backend:
✅ Kafka message streaming
✅ ML anomaly detection
✅ MongoDB persistence
✅ WebSocket broadcasting
✅ RESTful API
✅ Async processing

## 🧪 Testing

### Manual Testing:
1. Click \"Generate Transactions\" in the dashboard
2. Watch real-time updates in the transaction feed
3. Monitor fraud detection in action
4. Check system status indicators

### API Testing:
```bash
# Generate 10 test transactions
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -X POST \"$API_URL/api/generate-transactions?count=10\"

# Check stats
curl \"$API_URL/api/stats\"
```

## 📝 Logs

### Backend Logs:
```bash
tail -f /var/log/supervisor/backend.err.log
```

### Consumer Logs:
```bash
tail -f /var/log/fraud_consumer.log
```

### Producer Logs:
```bash
tail -f /var/log/fraud_producer.log
```

### Kafka Logs:
```bash
docker logs kafka
```

## 🔍 Monitoring

### Check Kafka Status:
```bash
docker ps | grep kafka
```

### Check Topics:
```bash
docker exec kafka kafka-topics --list --bootstrap-server localhost:9092
```

### Check Consumer Groups:
```bash
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list
```

## 🎯 Key Concepts

### Event Streaming:
Data flows continuously from producer → Kafka → consumer

### Message Broker:
Kafka acts as a buffer between data sources and processors

### Distributed Processing:
Spark handles large-scale data processing

### Real-time ML:
Fraud detection happens instantly as transactions arrive

### WebSocket Communication:
Live updates pushed to dashboard without polling

## 🚀 Production Considerations

### Scaling:
- Increase Kafka partitions for parallel processing
- Deploy multiple consumer instances
- Use Spark cluster for distributed processing

### Monitoring:
- Add Prometheus + Grafana for metrics
- Implement alerting for high fraud rates
- Track system performance

### ML Improvements:
- Add more features (transaction history, velocity)
- Use ensemble methods (Random Forest + Isolation Forest)
- Implement online learning for model updates
- Add explainability (SHAP values)

### Security:
- Encrypt Kafka messages
- Secure WebSocket connections
- Implement authentication
- Add rate limiting

## 📊 Business Value

This system demonstrates:
- ✅ Real-time big data processing
- ✅ Machine learning in production
- ✅ Distributed systems architecture
- ✅ Streaming data pipelines
- ✅ Modern web technologies
- ✅ Production-ready code

## 🎓 Learning Outcomes

By building this project, you've mastered:
1. **Kafka** - Real-time message streaming
2. **Spark** - Distributed data processing
3. **ML** - Anomaly detection with Isolation Forest
4. **WebSockets** - Real-time bidirectional communication
5. **React** - Modern frontend development
6. **FastAPI** - Async Python web framework
7. **Docker** - Container orchestration
8. **MongoDB** - NoSQL database operations

---

Built with ❤️ using Kafka, Spark, FastAPI, and React
"
Observation: Overwrite successful: /app/README.md
