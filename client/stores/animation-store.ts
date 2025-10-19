import { create } from 'zustand';

interface Stats {
    totalVolume: number;
    activeLoans: number;
    lenders: number;
    avgApy: number;
}

interface ExtendedStats extends Stats {
    borrowers: number;
    defaultRate: number;
    avgLoanSize: number;
    processingTime: number;
}

interface LiveMetrics {
    tps: number;
    uptime: number;
    users: number;
}

interface Transaction {
    id: string;
    amount: number;
    type: "borrow" | "lend";
    time: string;
}

interface AnimationState {
    stats: Stats;
    extendedStats: ExtendedStats;
    liveMetrics: LiveMetrics;

    recentTransactions: Transaction[];

    isStatsAnimating: boolean;
    isExtendedStatsAnimating: boolean;
    isMetricsAnimating: boolean;
    isTransactionsAnimating: boolean;

    animateStats: () => void;
    animateExtendedStats: () => void;
    animateMetrics: () => void;
    generateTransactions: () => void;

    resetStats: () => void;
    resetExtendedStats: () => void;
    resetMetrics: () => void;
}

const initialStats: Stats = {
    totalVolume: 0,
    activeLoans: 0,
    lenders: 0,
    avgApy: 0,
};

const initialExtendedStats: ExtendedStats = {
    totalVolume: 0,
    activeLoans: 0,
    lenders: 0,
    avgApy: 0,
    borrowers: 0,
    defaultRate: 0,
    avgLoanSize: 0,
    processingTime: 0,
};

const initialMetrics: LiveMetrics = {
    tps: 0,
    uptime: 0,
    users: 0,
};

export const useAnimationStore = create<AnimationState>((set, get) => ({
    stats: initialStats,
    extendedStats: initialExtendedStats,
    liveMetrics: initialMetrics,
    recentTransactions: [],

    isStatsAnimating: false,
    isExtendedStatsAnimating: false,
    isMetricsAnimating: false,
    isTransactionsAnimating: false,

    animateStats: () => {
        const state = get();
        if (state.isStatsAnimating) return;

        set({ isStatsAnimating: true });

        const targetStats: Stats = {
            totalVolume: 12470000,
            activeLoans: 2847,
            lenders: 1243,
            avgApy: 12.4,
        };

        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            set({
                stats: {
                    totalVolume: Math.floor(targetStats.totalVolume * progress),
                    activeLoans: Math.floor(targetStats.activeLoans * progress),
                    lenders: Math.floor(targetStats.lenders * progress),
                    avgApy: Number((targetStats.avgApy * progress).toFixed(1)),
                }
            });

            if (currentStep >= steps) {
                clearInterval(interval);
                set({
                    stats: targetStats,
                    isStatsAnimating: false
                });
            }
        }, stepDuration);
    },

    animateExtendedStats: () => {
        const state = get();
        if (state.isExtendedStatsAnimating) return;

        set({ isExtendedStatsAnimating: true });

        const targetStats: ExtendedStats = {
            totalVolume: 12470000,
            activeLoans: 2847,
            lenders: 1243,
            borrowers: 1604,
            avgApy: 12.4,
            defaultRate: 0.8,
            avgLoanSize: 4500,
            processingTime: 2.3,
        };

        const duration = 2500;
        const steps = 80;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            set({
                extendedStats: {
                    totalVolume: Math.floor(targetStats.totalVolume * progress),
                    activeLoans: Math.floor(targetStats.activeLoans * progress),
                    lenders: Math.floor(targetStats.lenders * progress),
                    borrowers: Math.floor(targetStats.borrowers * progress),
                    avgApy: Number((targetStats.avgApy * progress).toFixed(1)),
                    defaultRate: Number((targetStats.defaultRate * progress).toFixed(1)),
                    avgLoanSize: Math.floor(targetStats.avgLoanSize * progress),
                    processingTime: Number((targetStats.processingTime * progress).toFixed(1)),
                }
            });

            if (currentStep >= steps) {
                clearInterval(interval);
                set({
                    extendedStats: targetStats,
                    isExtendedStatsAnimating: false
                });
            }
        }, stepDuration);
    },

    animateMetrics: () => {
        const state = get();
        if (state.isMetricsAnimating) return;

        set({ isMetricsAnimating: true });

        const targetMetrics: LiveMetrics = {
            tps: 65000,
            uptime: 99.9,
            users: 2847,
        };

        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            set({
                liveMetrics: {
                    tps: Math.floor(targetMetrics.tps * progress),
                    uptime: Number((targetMetrics.uptime * progress).toFixed(1)),
                    users: Math.floor(targetMetrics.users * progress),
                }
            });

            if (currentStep >= steps) {
                clearInterval(interval);
                set({
                    liveMetrics: targetMetrics,
                    isMetricsAnimating: false
                });
            }
        }, stepDuration);
    },

    generateTransactions: () => {
        const state = get();
        if (state.isTransactionsAnimating) return;

        set({ isTransactionsAnimating: true });

        const generateTransaction = (): Transaction => ({
            id: Math.random().toString(36).substr(2, 9),
            amount: Math.floor(Math.random() * 50000) + 1000,
            type: Math.random() > 0.5 ? "borrow" : "lend",
            time: "Just now",
        });

        const transactions: Transaction[] = Array.from({ length: 3 }, generateTransaction);
        set({
            recentTransactions: transactions,
            isTransactionsAnimating: false
        });
    },

    resetStats: () => set({ stats: initialStats, isStatsAnimating: false }),
    resetExtendedStats: () => set({ extendedStats: initialExtendedStats, isExtendedStatsAnimating: false }),
    resetMetrics: () => set({ liveMetrics: initialMetrics, isMetricsAnimating: false }),
}));
