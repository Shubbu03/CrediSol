"use client";

import { DollarSign, PieChart } from "lucide-react";

interface LoaderProps {
    message?: string;
    subMessage?: string;
    icon?: React.ReactNode;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Loader({
    message = "Loading...",
    subMessage,
    icon,
    size = "md",
    className = ""
}: LoaderProps) {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    };

    const textSizeClasses = {
        sm: "text-sm",
        md: "text-lg",
        lg: "text-xl"
    };

    return (
        <div className={`text-center py-8 ${className}`}>
            {icon ? (
                <div className="mb-4">
                    {icon}
                </div>
            ) : (
                <div className={`animate-spin rounded-full border-b-2 border-trust-green mx-auto mb-4 ${sizeClasses[size]}`}></div>
            )}
            <p className={`text-foreground/60 font-medium mb-2 ${textSizeClasses[size]}`}>
                {message}
            </p>
            {subMessage && (
                <p className="text-sm text-foreground/50">
                    {subMessage}
                </p>
            )}
        </div>
    );
}

export function LoansLoader() {
    return (
        <Loader
            message="Loading loans..."
            subMessage="Finding the best lending opportunities for you"
        />
    );
}

export function PortfolioLoader() {
    return (
        <Loader
            message="Loading portfolio..."
            subMessage="Fetching your lending positions"
        />
    );
}

// Empty State Component
interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    className = ""
}: EmptyStateProps) {
    return (
        <div className={`text-center py-8 ${className}`}>
            <div className="mb-4">
                {icon}
            </div>
            <p className="text-foreground/60 text-lg font-medium mb-2">
                {title}
            </p>
            <p className="text-sm text-foreground/50">
                {description}
            </p>
        </div>
    );
}

export function NoLoansEmptyState() {
    return (
        <EmptyState
            icon={<DollarSign className="w-12 h-12 text-foreground/30 mx-auto" />}
            title="No current loans to fund"
            description="Check back later for new lending opportunities"
        />
    );
}

export function NoPortfolioEmptyState() {
    return (
        <EmptyState
            icon={<PieChart className="w-12 h-12 text-foreground/30 mx-auto" />}
            title="No funded positions yet"
            description="Start funding loans to build your portfolio"
        />
    );
}
