import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, ShieldAlert, Database } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const RiskBadge = ({ risk, isNew }) => {
  const variants = {
    HIGH: "bg-red-500/20 text-red-400 border-red-500/50",
    MEDIUM: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    LOW: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  };

  return (
    <Badge
      className={`${variants[risk] || variants.LOW} rounded-sm px-2 py-0.5 text-xs font-mono uppercase tracking-wider ${
        isNew ? "animate-pulse" : ""
      }`}
      data-testid={`risk-badge-${risk.toLowerCase()}`}
    >
      {risk}
    </Badge>
  );
};

const FraudIcon = ({ isFraud }) => {
  return isFraud ? (
    <AlertTriangle className="h-4 w-4 text-red-500" data-testid="fraud-icon" />
  ) : (
    <CheckCircle className="h-4 w-4 text-emerald-500" data-testid="safe-icon" />
  );
};

export const TransactionFeed = ({ transactions }) => {
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "--:--:--";
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-none" data-testid="transaction-feed-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-50">
          Live Transaction Feed
        </CardTitle>
        <ShieldAlert className="h-5 w-5 text-zinc-400" />
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 bg-zinc-900 backdrop-blur-md z-10">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Transaction ID</TableHead>
                <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Amount</TableHead>
                <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Merchant</TableHead>
                <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Country</TableHead>
                <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Risk</TableHead>
                <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Score</TableHead>
                <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {transactions.map((tx, index) => (
                  <motion.tr
                    key={tx.transaction_id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className={`border-zinc-800 hover:bg-zinc-800/50 transition-colors ${
                      tx.is_fraud ? "bg-red-500/5" : ""
                    }`}
                    data-testid={`transaction-row-${index}`}
                  >
                    <TableCell>
                      <FraudIcon isFraud={tx.is_fraud} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400" data-testid={`transaction-id-${index}`}>
                      {tx.transaction_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-sm text-zinc-50 font-semibold" data-testid={`transaction-amount-${index}`}>
                      {formatAmount(tx.amount)}
                    </TableCell>
                    <TableCell className="text-zinc-300" data-testid={`transaction-merchant-${index}`}>{tx.merchant}</TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400" data-testid={`transaction-country-${index}`}>
                      {tx.country}
                    </TableCell>
                    <TableCell>
                      <RiskBadge risk={tx.fraud_risk} isNew={index === 0} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400" data-testid={`transaction-risk-score-${index}`}>
                      {(tx.risk_score * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-500" data-testid={`transaction-time-${index}`}>
                      {formatTime(tx.timestamp)}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          {transactions.length === 0 && (
            <div className="flex items-center justify-center h-64 text-zinc-500" data-testid="no-transactions-message">
              <div className="text-center">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">No transactions yet</p>
                <p className="text-xs mt-2">Waiting for data stream...</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
