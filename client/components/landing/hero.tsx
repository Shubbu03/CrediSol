"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8 },
        },
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 px-4 bg-background">
            <motion.div
                className="absolute inset-0 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
            >
                <motion.div
                    className="absolute top-1/4 -left-1/2 w-96 h-96 bg-violet-500/10 dark:bg-violet-600/10 rounded-full blur-3xl"
                    animate={{
                        y: [0, 50, 0],
                        x: [0, 30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl"
                    animate={{
                        y: [0, -50, 0],
                        x: [0, -30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    }}
                />
            </motion.div>

            <motion.div
                className="relative z-10 max-w-3xl text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight"
                >
                    <span className="bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                        Borrow and Lend.
                    </span>
                    <br />
                    Reinvented.
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-lg sm:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed"
                >
                    zkLend enables instant, undercollateralized loans powered by zero-knowledge credit scoring. Access liquidity without the barriers.
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <motion.a
                        href="/app"
                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Launch App
                        <ArrowRight className="w-5 h-5" />
                    </motion.a>
                    <motion.button
                        className="px-8 py-3 border-2 border-foreground/20 text-foreground font-semibold rounded-lg hover:bg-foreground/5 transition-colors duration-300"
                        whileHover={{ scale: 1.05, borderColor: "currentColor" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const featuresSection = document.getElementById("features");
                            featuresSection?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        Learn More
                    </motion.button>
                </motion.div>
            </motion.div>
        </section>
    );
}
