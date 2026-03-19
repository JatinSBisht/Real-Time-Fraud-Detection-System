
Action: file_editor create /app/frontend/src/pages/Dashboard.js --file-text "import { motion } from \"framer-motion\";
import { Shield, Zap, RefreshCw } from \"lucide-react\";
import { Button } from \"@/components/ui/button\";
import { StatsGrid } from \"@/components/StatsGrid\";
import { TransactionFeed } from \"@/components/TransactionFeed\";
import { SystemStatus } from \"@/components/SystemStatus\";
import { FraudRateChart } from \"@/components/FraudRateChart\";
import { useFraudDetection } from \"@/hooks/useFraudDetection\";
import { toast } from \"sonner\";

export const Dashboard = () => {
  const { transactions, stats, systemStatus, loading, generateTransactions, refreshData } =
    useFraudDetection();

  const handleGenerateTransactions = async () => {
    toast.loading(\"Generating transactions...\", { id: \"generate\" });
    await generateTransactions(10);
    toast.success(\"10 transactions generated!\", { id: \"generate\" });
  };

  const handleRefresh = async () => {
    toast.loading(\"Refreshing data...\", { id: \"refresh\" });
    await refreshData();
    toast.success(\"Data refreshed!\", { id: \"refresh\" });
  };

  if (loading) {
    return (
      <div className=\"min-h-screen bg-zinc-950 flex items-center justify-center\">
        <div className=\"text-center\" data-testid=\"loading-indicator\">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: \"linear\" }}
            className=\"inline-block\"
          >
            <Shield className=\"h-12 w-12 text-zinc-400\" />
          </motion.div>
          <p className=\"mt-4 text-zinc-400 font-mono\">Loading Sentinel System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-zinc-950\" data-testid=\"dashboard-page\">
      {/* Header */}
      <header className=\"sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800\">
        <div className=\"container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]\">
          <div className=\"flex items-center justify-between h-16\">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className=\"flex items-center gap-3\"
            >
              <Shield className=\"h-8 w-8 text-red-500\" />
              <div>
                <h1 className=\"text-2xl font-bold tracking-tight text-zinc-50\" data-testid=\"dashboard-title\">
                  Sentinel
                </h1>
                <p className=\"text-xs text-zinc-500 font-mono\">Real-Time Fraud Detection</p>
              </div>
            </motion.div>
            <div className=\"flex items-center gap-3\">
              <Button
                onClick={handleRefresh}
                variant=\"outline\"
                size=\"sm\"
                className=\"bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50\"
                data-testid=\"refresh-button\"
              >
                <RefreshCw className=\"h-4 w-4 mr-2\" />
                Refresh
              </Button>
              <Button
                onClick={handleGenerateTransactions}
                size=\"sm\"
                className=\"bg-red-600 hover:bg-red-700 text-white\"
                data-testid=\"generate-transactions-button\"
              >
                <Zap className=\"h-4 w-4 mr-2\" />
                Generate Transactions
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className=\"container mx-auto p-4 md:p-6 lg:p-8 max-w-[1600px]\">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className=\"mb-6\"
        >
          <StatsGrid stats={stats} />
        </motion.div>

        {/* Main Grid */}
        <div className=\"grid grid-cols-1 md:grid-cols-12 gap-6\">
          {/* Transaction Feed - Main Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className=\"col-span-1 md:col-span-8 lg:col-span-9\"
          >
            <TransactionFeed transactions={transactions} />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className=\"col-span-1 md:col-span-4 lg:col-span-3 space-y-6\"
          >
            <SystemStatus status={systemStatus} />
            <FraudRateChart transactions={transactions} />
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className=\"mt-8 text-center text-xs text-zinc-600 font-mono\"
        >
          <p>Powered by Kafka + Spark + ML Isolation Forest</p>
          <p className=\"mt-1\">Real-time streaming architecture for fraud detection</p>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
"
Observation: Create successful: /app/frontend/src/pages/Dashboard.js
