import { motion } from "framer-motion";
import { Activity, AlertTriangle, TrendingUp, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default" }) => {
  const variantStyles = {
    default: "bg-zinc-900 border-zinc-800",
    danger: "bg-zinc-900 border-red-500/30",
    success: "bg-zinc-900 border-emerald-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <Card className={`${variantStyles[variant]} shadow-none hover:bg-zinc-800/50 transition-colors duration-200`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-zinc-400" />}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-zinc-50" data-testid={`stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</div>
          {subtitle && (
            <p className="text-xs text-zinc-500 mt-1">
              {trend && (
                <span className={trend > 0 ? "text-red-500" : "text-emerald-500"}>
                  {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%{" "}
                </span>
              )}
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-grid">
      <StatCard
        title="Total Transactions"
        value={stats.total_transactions?.toLocaleString() || "0"}
        subtitle="All time"
        icon={Database}
        variant="default"
      />
      <StatCard
        title="Fraud Detected"
        value={stats.fraud_detected?.toLocaleString() || "0"}
        subtitle="Suspicious activity"
        icon={AlertTriangle}
        variant="danger"
      />
      <StatCard
        title="Fraud Rate"
        value={`${stats.fraud_rate?.toFixed(1) || "0.0"}%`}
        subtitle="Detection rate"
        icon={TrendingUp}
        variant={stats.fraud_rate > 10 ? "danger" : "default"}
      />
      <StatCard
        title="System Health"
        value="Operational"
        subtitle="All services running"
        icon={Activity}
        variant="success"
      />
    </div>
  );
};
