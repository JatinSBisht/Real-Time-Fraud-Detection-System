import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-lg">
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-zinc-50 text-sm font-mono">
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const FraudRateChart = ({ transactions }) => {
  // Generate chart data from transactions
  const generateChartData = () => {
    if (transactions.length === 0) {
      return Array.from({ length: 10 }, (_, i) => ({
        time: `T-${10 - i}`,
        fraudRate: 0,
        total: 0,
      }));
    }

    // Group by time buckets (last 10 data points)
    const bucketSize = Math.max(1, Math.floor(transactions.length / 10));
    const data = [];

    for (let i = 0; i < Math.min(10, transactions.length); i++) {
      const start = i * bucketSize;
      const end = Math.min(start + bucketSize, transactions.length);
      const bucket = transactions.slice(start, end);

      const fraudCount = bucket.filter((t) => t.is_fraud).length;
      const fraudRate = bucket.length > 0 ? (fraudCount / bucket.length) * 100 : 0;

      data.push({
        time: `T-${10 - i}`,
        fraudRate: parseFloat(fraudRate.toFixed(1)),
        total: bucket.length,
      });
    }

    return data.reverse();
  };

  const chartData = generateChartData();

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-none" data-testid="fraud-rate-chart">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight text-zinc-50 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Fraud Rate Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
            <XAxis
              dataKey="time"
              stroke="#71717A"
              style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
            />
            <YAxis
              stroke="#71717A"
              style={{ fontSize: "12px", fontFamily: "JetBrains Mono" }}
              label={{ value: "Rate (%)", angle: -90, position: "insideLeft", fill: "#71717A" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="fraudRate"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#fraudGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
