"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Filter, X } from "lucide-react";
import { useLoansList, useLoanFiltersStore } from "../../hooks/use-loans";
import { LoanCard } from "../../components/lender/loan-card";
import { LoanFilters } from "../../components/lender/filters";
import { LoansLoader, NoLoansEmptyState } from "../../components/shared/loader";
import { AuthGuard } from "../../components/shared/auth-guard";
import { BackButton } from "../../components/shared/back-button";

const ITEMS_PER_PAGE = 9;

export default function MarketplacePage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const { termMonths, minAprBps, minScore, setFilters } = useLoanFiltersStore();

    const hasActiveFilters = termMonths !== undefined || minAprBps !== undefined || minScore !== undefined;

    const clearAllFilters = () => {
        setFilters({ termMonths: undefined, minAprBps: undefined, minScore: undefined });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    };

    function MarketplaceGrid() {
        const { data, isLoading } = useLoansList();

        if (isLoading) {
            return <LoansLoader />;
        }

        if (!data || data.length === 0) {
            return <NoLoansEmptyState />;
        }

        const filteredLoans = data.filter(loan =>
            loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.borrower.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentLoans = filteredLoans.slice(startIndex, endIndex);

        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentLoans.map((loan) => (
                        <LoanCard key={loan.id} loan={loan} />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-border/30 hover:bg-surface-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                        ? "bg-trust-green text-white"
                                        : "text-foreground/70 hover:bg-surface-1"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-border/30 hover:bg-surface-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="text-center text-sm text-foreground/60 mt-4">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredLoans.length)} of {filteredLoans.length} loans
                </div>
            </>
        );
    }

    return (
        <AuthGuard requiredRole="lender">
            <div className="min-h-screen bg-background">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-trust-green/10 to-emerald-500/10 rounded-full blur-3xl" />
                    {/* <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-full blur-3xl" /> */}
                </div>

                <div className="relative z-10 min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants} className="mb-8">
                                <BackButton href="/dashboard/lender" />
                                <h1 className="text-3xl font-bold mb-2">Available Lending Opportunities</h1>
                                <p className="text-foreground/70">
                                    Discover and fund lending opportunities with competitive returns and transparent risk assessment.
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="mb-8">
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                        <div className="flex-1 max-w-md">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                                <input
                                                    type="text"
                                                    placeholder="Search by loan ID or borrower..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-surface-1 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-green/20 focus:border-trust-green/50"
                                                />
                                            </div>
                                        </div>

                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearAllFilters}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/70 hover:text-white bg-surface-1 border border-border/30 rounded-lg hover:bg-red-500 hover:border-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Clear All Filters
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Filter className="w-4 h-4 text-foreground/70" />
                                        <span className="text-sm text-foreground/70 font-medium">Filters:</span>
                                    </div>
                                    <LoanFilters />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                    <MarketplaceGrid />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
