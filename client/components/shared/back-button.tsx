"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
    label?: string;
    href?: string;
    className?: string;
}

export function BackButton({
    label = "Back to Dashboard",
    href,
    className = "flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-6 transition-colors"
}: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <button
            className={className}
            onClick={handleClick}
        >
            <ChevronLeft className="w-4 h-4" />
            {label}
        </button>
    );
}
