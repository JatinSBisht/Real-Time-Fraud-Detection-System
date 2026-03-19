import { motion } from "framer-motion";
import { Activity, Database, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatusIndicator = ({ connected, label }) => {
  return (
    <div className="flex items-center gap-3" data-testid={`status-indicator-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      {connected ? (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="relative"
        >
          <div className="h-3 w-3 rounded-full bg-emerald-500" data-testid="status-dot-connected" />
          <div className="absolute inset-0 h-3 w-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
        </motion.div>
      ) : (
        <div className="h-3 w-3 rounded-full bg-red-500" data-testid="status-dot-disconnected" />
      )}
      <div>
        <p className="text-sm font-medium text-zinc-300">{label}</p>
        <p className="text-xs text-zinc-500">{connected ? "Connected" : "Disconnected"}</p>
      </div>
    </div>
  );
};

export const SystemStatus = ({ status }) => {
  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-none" data-testid="system-status-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight text-zinc-50 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatusIndicator connected={status.kafka_connected} label="Kafka Stream" />
        <StatusIndicator connected={status.spark_running} label="Spark Processing" />
        <div className="pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Database</span>
            <span className="text-emerald-400 font-mono font-medium" data-testid="database-status">MongoDB Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
