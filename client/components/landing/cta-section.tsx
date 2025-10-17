"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background">
            <motion.div
                className="absolute inset-0 -z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 dark:bg-violet-600/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </motion.div>

            <motion.div
                className="max-w-3xl mx-auto text-center relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                    Start Lending Today.
                </h2>
                <p className="text-lg text-foreground/60 mb-10 max-w-xl mx-auto">
                    Join thousands of users accessing instant liquidity and earning passive yield through zkLend.
                </p>

                <motion.a
                    href="/app"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300"
                    whileHover={{
                        scale: 1.08,
                        boxShadow: "0 25px 50px rgba(139, 92, 246, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                >
                    Enter App
                    <ArrowRight className="w-5 h-5" />
                </motion.a>
            </motion.div>
        </section>
    );
}
