
import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

export const useFraudDetection = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    total_transactions: 0,
    fraud_detected: 0,
    fraud_rate: 0,
  });
  const [systemStatus, setSystemStatus] = useState({
    kafka_connected: false,
    spark_running: false,
  });
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState(null);

  // Fetch initial transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions?limit=50`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get(`${API}/system-status`);
      setSystemStatus(response.data);
    } catch (error) {
      console.error("Error fetching system status:", error);
    }
  };


  // Generate transactions
  const generateTransactions = async (count = 10) => {
    try {
      await axios.post(`${API}/generate-transactions?count=${count}`);
      await fetchStats();
    } catch (error) {
      console.error("Error generating transactions:", error);
    }
  };

  // Setup WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket(`${WS_URL}/api/ws`);

      websocket.onopen = () => {
        console.log("WebSocket connected");
        // Send ping every 30 seconds to keep alive
        const pingInterval = setInterval(() => {
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.send("ping");
          }
        }, 30000);
        websocket.pingInterval = pingInterval;
      };

      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "new_transaction") {
            // Add new transaction to the top
            setTransactions((prev) => [message.data, ...prev.slice(0, 49)]);
            // Update stats
            setStats((prev) => ({
              ...prev,
              total_transactions: prev.total_transactions + 1,
              fraud_detected: message.data.is_fraud
                ? prev.fraud_detected + 1
                : prev.fraud_detected,
              fraud_rate:
                ((message.data.is_fraud ? prev.fraud_detected + 1 : prev.fraud_detected) /
                  (prev.total_transactions + 1)) *
                100,
            }));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      websocket.onclose = () => {
        console.log("WebSocket disconnected");
        if (websocket.pingInterval) {
          clearInterval(websocket.pingInterval);
        }
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      setWs(websocket);
    };

    connectWebSocket();

    return () => {
      if (ws) {
        if (ws.pingInterval) {
          clearInterval(ws.pingInterval);
        }
        ws.close();
      }
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTransactions(), fetchStats(), fetchSystemStatus()]);
      setLoading(false);
    };

    loadData();

    // Refresh stats every 10 seconds
    const statsInterval = setInterval(fetchStats, 10000);
    const statusInterval = setInterval(fetchSystemStatus, 15000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(statusInterval);
    };
  }, []);

  return {
    transactions,
    stats,
    systemStatus,
    loading,
    generateTransactions,
    refreshData: async () => {
      await Promise.all([fetchTransactions(), fetchStats(), fetchSystemStatus()]);
    },
  };
};
