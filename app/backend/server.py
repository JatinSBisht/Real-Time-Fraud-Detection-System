Now let me update the backend server to use the queue-based system:
Action: file_editor create /app/backend/server.py --file-text "from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from models import Transaction, TransactionCreate, SystemStatus
from typing import List
from datetime import datetime, timezone
import asyncio
import queue
from transaction_producer import TransactionProducer
from fraud_consumer import FraudDetectionConsumer
from ml_fraud_detector import MLFraudDetector

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create transaction queue (replaces Kafka)
transaction_queue = queue.Queue()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except:
                self.active_connections.remove(connection)

manager = ConnectionManager()

# Initialize producer and consumer
producer = TransactionProducer(transaction_queue)
consumer = FraudDetectionConsumer(transaction_queue, mongo_url, os.environ['DB_NAME'], manager)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix=\"/api\")

@api_router.get(\"/\")
async def root():
    return {\"message\": \"Fraud Detection System API\", \"status\": \"running\"}

@api_router.get(\"/transactions\", response_model=List[Transaction])
async def get_transactions(limit: int = 100):
    \"\"\"Get recent transactions\"\"\"
    transactions = await db.transactions.find({}, {\"_id\": 0}).sort(\"timestamp\", -1).limit(limit).to_list(limit)
    return transactions

@api_router.post(\"/transactions\", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate):
    \"\"\"Manually create a transaction\"\"\"
    trans_dict = transaction.model_dump()
    trans_dict['timestamp'] = datetime.now(timezone.utc).isoformat()
    
    # Send to queue
    sent = producer.send_transaction(trans_dict)
    
    if sent:
        return Transaction(**sent)
    else:
        return {\"error\": \"Failed to create transaction\"}

@api_router.get(\"/stats\")
async def get_stats():
    \"\"\"Get system statistics\"\"\"
    total = await db.transactions.count_documents({})
    fraud = await db.transactions.count_documents({\"is_fraud\": True})
    
    # Calculate fraud rate
    fraud_rate = (fraud / total * 100) if total > 0 else 0
    
    return {
        \"total_transactions\": total,
        \"fraud_detected\": fraud,
        \"fraud_rate\": round(fraud_rate, 2),
        \"recent_transactions\": total,
        \"timestamp\": datetime.now(timezone.utc).isoformat()
    }

@api_router.get(\"/system-status\")
async def get_system_status():
    \"\"\"Get system status\"\"\"
    kafka_connected = producer.running
    spark_running = consumer.running
    
    total = await db.transactions.count_documents({})
    fraud = await db.transactions.count_documents({\"is_fraud\": True})
    
    return SystemStatus(
        kafka_connected=kafka_connected,
        spark_running=spark_running,
        total_transactions=total,
        fraud_detected=fraud,
        last_updated=datetime.now(timezone.utc).isoformat()
    )

@api_router.post(\"/generate-transactions\")
async def generate_transactions(count: int = 10):
    \"\"\"Generate multiple transactions for testing\"\"\"
    generated = []
    for _ in range(count):
        transaction = producer.generate_transaction()
        sent = producer.send_transaction(transaction)
        if sent:
            generated.append(sent)
    
    return {
        \"generated\": len(generated),
        \"transactions\": generated
    }

@api_router.websocket(\"/ws\")
async def websocket_endpoint(websocket: WebSocket):
    \"\"\"WebSocket endpoint for real-time updates\"\"\"
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            if data == \"ping\":
                await websocket.send_text(\"pong\")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event(\"startup\")
async def startup_event():
    logger.info(\"Starting Fraud Detection System...\")
    
    # Start consumer
    consumer.start()
    
    # Start producer (generates transactions every 3 seconds)
    producer.start_continuous(interval=3)
    
    # Generate initial training data if needed
    existing = await db.transactions.count_documents({})
    if existing < 20:
        logger.info(\"Generating initial training data...\")
        for _ in range(30):
            transaction = producer.generate_transaction()
            producer.send_transaction(transaction)
        await asyncio.sleep(2)
    
    logger.info(\"System started successfully!\")

@app.on_event(\"shutdown\")
async def shutdown_event():
    producer.stop()
    consumer.stop()
    client.close()
    logger.info(\"System shutdown complete\")
"
Observation: Overwrite successful: /app/backend/server.py
