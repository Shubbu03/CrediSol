"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useLoanDetail, useLenderFund, useCreditScore, bpsToPct, formatCurrencyMinor, getLoanState } from "../../../../hooks/use-loans";
import { useState } from "react";
import { BackButton } from "../../../../components/shared/back-button";
import {
    Calendar,
    DollarSign,
    Shield,
    TrendingUp,
    Clock,
    User,
    AlertCircle,
    CheckCircle,
    XCircle,
    Info
} from "lucide-react";

export default function LoanDetailPage() {
    const params = useParams<{ loanId: string }>();
    const loanId = params?.loanId;
    const { connected } = useWallet();
    const { data: loan, isLoading } = useLoanDetail(loanId);
    const { data: creditScore } = useCreditScore(loan?.borrower || "", loanId || "");
    const fund = useLenderFund();
    const [amount, setAmount] = useState<string>("");

    const progress = loan ? Math.min(100, Math.round((loan.fundedAmount / loan.targetAmount) * 100)) : 0;
    const remainingAmount = loan ? loan.targetAmount - loan.fundedAmount : 0;
    const isFullyFunded = progress >= 100;
    const canFund = !isFullyFunded && loan?.state === 1; // 1 = Funding state

    if (!connected) {
        return (
            <div className="min-h-screen bg-background">
                <div className="pt-24 max-w-xl mx-auto px-4">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-2">Connect your wallet</h1>
                        <p className="text-foreground/70">Please connect your Solana wallet to fund this loan.</p>
                    </div>
                    <div className="flex justify-center">
                        <WalletMultiButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                <BackButton />

                {isLoading || !loan ? (
                    <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-border/20 rounded w-1/3"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="h-32 bg-border/20 rounded"></div>
                                <div className="h-32 bg-border/20 rounded"></div>
                                <div className="h-32 bg-border/20 rounded"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-surface-1 rounded-xl border border-border/30"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Loan Details</h1>
                                    <p className="text-foreground/70 font-mono text-sm">#{loan.id}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                    <StatusBadge state={getLoanState(loan.state)} />
                                    <div className="px-3 py-1 rounded-full text-sm font-medium bg-trust-green/10 text-trust-green">
                                        {bpsToPct(loan.aprBps)} APR
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <MetricCard
                                    icon={<DollarSign className="w-5 h-5" />}
                                    label="Loan Amount"
                                    value={formatCurrencyMinor(loan.amount)}
                                    subtitle="Total requested"
                                />
                                <MetricCard
                                    icon={<TrendingUp className="w-5 h-5" />}
                                    label="Interest Rate"
                                    value={`${bpsToPct(loan.aprBps)}%`}
                                    subtitle="Annual percentage"
                                />
                                <MetricCard
                                    icon={<Calendar className="w-5 h-5" />}
                                    label="Term"
                                    value={`${loan.termMonths.toFixed(1)} months`}
                                    subtitle="Repayment period"
                                />
                                <MetricCard
                                    icon={<Shield className="w-5 h-5" />}
                                    label="Collateral"
                                    value={`${loan.collateralPct.toFixed(1)}%`}
                                    subtitle="Required collateral"
                                />
                            </div>

                            {/* Funding Progress */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Funding Progress</h3>
                                    <div className="text-sm text-foreground/70">
                                        {formatCurrencyMinor(loan.fundedAmount)} / {formatCurrencyMinor(loan.targetAmount)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-border/40 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-trust-green to-emerald-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ type: "spring", stiffness: 80, damping: 20 }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground/70">0%</span>
                                        <span className="font-medium">{progress}% funded</span>
                                        <span className="text-foreground/70">100%</span>
                                    </div>
                                </div>

                                {remainingAmount > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-foreground/70">
                                        <Info className="w-4 h-4" />
                                        <span>{formatCurrencyMinor(remainingAmount)} remaining to reach funding goal</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Detailed Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Borrower Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 bg-surface-1 rounded-xl border border-border/30"
                            >
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Borrower Information
                                </h3>
                                <div className="space-y-3">
                                    <InfoRow label="Borrower Address" value={loan.borrower} copyable />
                                    <InfoRow label="Credit Score" value={creditScore?.score?.toString() || "N/A"} />
                                    <InfoRow label="Credit Grade" value={creditScore?.grade || "N/A"} />
                                    <InfoRow label="Risk Assessment" value={creditScore?.pdBps ? `${(creditScore.pdBps / 100).toFixed(2)}%` : "N/A"} />
                                </div>
                            </motion.div>

                            {/* Loan Terms */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 bg-surface-1 rounded-xl border border-border/30"
                            >
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Loan Terms
                                </h3>
                                <div className="space-y-3">
                                    <InfoRow label="Loan State" value={getLoanState(loan.state)} />
                                    <InfoRow label="Start Date" value={new Date(loan.startTs * 1000).toLocaleDateString()} />
                                    <InfoRow label="Maturity Date" value={new Date((loan.startTs + loan.termSecs) * 1000).toLocaleDateString()} />
                                    <InfoRow label="Outstanding Principal" value={formatCurrencyMinor(loan.outstandingPrincipal)} />
                                    <InfoRow label="Total Repaid" value={formatCurrencyMinor(loan.totalRepaidPrincipal + loan.totalRepaidInterest)} />
                                </div>
                            </motion.div>
                        </div>

                        {/* Funding Section */}
                        {canFund && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-6 bg-surface-1 rounded-xl border border-border/30"
                            >
                                <h3 className="text-lg font-semibold mb-4">Fund This Loan</h3>
                                <form
                                    className="space-y-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const minor = Math.round(Number(amount || 0) * 1_000_000);
                                        if (!minor || !loanId) return;
                                        fund.mutate({ loanId, amount: minor });
                                    }}
                                >
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Amount to Fund (USD)</label>
                                        <input
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Enter amount in USD"
                                            className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-trust-green/40"
                                            inputMode="decimal"
                                            type="number"
                                            min="1"
                                            max={remainingAmount / 1_000_000}
                                        />
                                        <p className="text-xs text-foreground/60 mt-1">
                                            Maximum: {formatCurrencyMinor(remainingAmount)}
                                        </p>
                                    </div>
                                    <div className="flex justify-center sm:justify-start">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={fund.isPending || !amount || Number(amount) <= 0}
                                            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-trust-green to-emerald-500 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {fund.isPending ? "Processing..." : "Fund Loan"}
                                        </motion.button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Fully Funded Message */}
                        {isFullyFunded && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl"
                            >
                                <div className="flex items-center gap-3 text-green-500">
                                    <CheckCircle className="w-6 h-6" />
                                    <div>
                                        <h3 className="font-semibold">Loan Fully Funded!</h3>
                                        <p className="text-sm text-green-500/80">This loan has reached its funding goal and is no longer accepting new investments.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Component for displaying key metrics with icons
function MetricCard({ icon, label, value, subtitle }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtitle?: string;
}) {
    return (
        <div className="p-4 rounded-lg bg-background border border-border/30">
            <div className="flex items-center gap-3 mb-2">
                <div className="text-trust-green">{icon}</div>
                <div className="text-sm text-foreground/60">{label}</div>
            </div>
            <div className="text-lg font-semibold mb-1">{value}</div>
            {subtitle && <div className="text-xs text-foreground/50">{subtitle}</div>}
        </div>
    );
}

// Component for displaying information rows
function InfoRow({ label, value, copyable = false }: {
    label: string;
    value: string;
    copyable?: boolean;
}) {
    const handleCopy = () => {
        if (copyable) {
            navigator.clipboard.writeText(value);
        }
    };

    return (
        <div className="flex justify-between items-center py-2">
            <span className="text-sm text-foreground/70">{label}</span>
            <span
                className={`text-sm font-medium ${copyable ? 'cursor-pointer hover:text-trust-green transition-colors' : ''}`}
                onClick={handleCopy}
                title={copyable ? 'Click to copy' : ''}
            >
                {copyable && value.length > 20 ? `${value.slice(0, 8)}...${value.slice(-8)}` : value}
            </span>
        </div>
    );
}

// Component for loan status badge
function StatusBadge({ state }: { state: string }) {
    const getStatusConfig = (state: string) => {
        switch (state) {
            case "funding":
                return {
                    label: "Funding",
                    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                    icon: <Clock className="w-3 h-3" />
                };
            case "active":
                return {
                    label: "Active",
                    className: "bg-green-500/10 text-green-500 border-green-500/20",
                    icon: <CheckCircle className="w-3 h-3" />
                };
            case "repaid":
                return {
                    label: "Repaid",
                    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                    icon: <CheckCircle className="w-3 h-3" />
                };
            case "defaulted":
                return {
                    label: "Defaulted",
                    className: "bg-red-500/10 text-red-500 border-red-500/20",
                    icon: <XCircle className="w-3 h-3" />
                };
            default:
                return {
                    label: "Unknown",
                    className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
                    icon: <AlertCircle className="w-3 h-3" />
                };
        }
    };

    const config = getStatusConfig(state);

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            {config.icon}
            {config.label}
        </div>
    );
}
