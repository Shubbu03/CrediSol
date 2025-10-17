"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";


export function Header() {
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { resolvedTheme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isLandingPage = pathname === "/";
    const navLinks = [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Dashboard", href: "/dashboard" },
    ];

    return (
        <motion.header
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60"
        >
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <motion.a
                    href="/"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="flex items-center gap-2"
                >
                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">zk</span>
                    </div>
                    <span className="hidden sm:inline text-lg font-semibold bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                        zkLend
                    </span>
                </motion.a>

                {isLandingPage && (
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link, i) => (
                            <motion.a
                                key={link.label}
                                href={link.href}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
                                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </motion.a>
                        ))}
                    </nav>
                )}

                <div className="flex items-center gap-2 sm:gap-4">
                    <motion.button
                        onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
                        className="relative inline-flex items-center justify-center rounded-lg bg-muted p-2 text-sm font-medium hover:bg-muted/80 transition-colors overflow-hidden"
                        aria-label="Toggle theme"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <motion.div
                            key={resolvedTheme}
                            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            {resolvedTheme === "light" ? (
                                <Moon className="h-5 w-5 text-slate-800" />
                            ) : (
                                <Sun className="h-5 w-5 text-yellow-400" />
                            )}
                        </motion.div>
                    </motion.button>

                    <motion.div
                        className="wallet-button-wrapper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                    >
                        <WalletMultiButton />
                    </motion.div>
                </div>
            </div>
        </motion.header>
    );
}
