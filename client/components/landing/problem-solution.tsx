"use client";

import { motion } from "framer-motion";
import {
  Lock,
  Clock,
  Shield,
  Eye,
  DollarSign,
  Zap,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { useState, useRef } from "react";

export default function ProblemSolution() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const problems = [
    {
      icon: Lock,
      title: "150%+ Collateral",
      description: "Capital locked, opportunity lost",
      impact: "Inefficient capital use",
    },
    {
      icon: Eye,
      title: "Privacy Invasion",
      description: "Personal data exposed to bureaus",
      impact: "Security & privacy risks",
    },
    {
      icon: Clock,
      title: "3-5 Day Wait",
      description: "Slow manual approval process",
      impact: "Missed opportunities",
    },
  ];

  const solutions = [
    {
      icon: DollarSign,
      title: "5-20% Collateral",
      description: "Keep capital working for you",
      impact: "95% more efficient",
      color: "text-trust-green",
    },
    {
      icon: Shield,
      title: "Zero-Knowledge Proofs",
      description: "Data never leaves your device",
      impact: "100% privacy preserved",
      color: "text-violet-500",
    },
    {
      icon: Zap,
      title: "0.4 Second Approval",
      description: "Instant smart contract execution",
      impact: "99.9% faster",
      color: "text-blue-500",
    },
  ];

  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-border/30 mb-6"
          >
            <div className="w-2 h-2 bg-trust-green rounded-full animate-pulse" />
            <span className="text-sm font-medium">The Evolution</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            From Broken to <span className="gradient-text">Revolutionary</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Traditional lending is fundamentally flawed. zkLend fixes it with cutting-edge technology.
          </p>
        </motion.div>

        {/* Interactive Comparison Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div
            ref={containerRef}
            className="relative bg-background rounded-2xl border border-border/40 overflow-hidden cursor-ew-resize select-none"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* Slider Container */}
            <div className="relative h-[400px] sm:h-[500px]">
              {/* Traditional Side (Left) */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5"
                style={{
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
              >
                <div className="h-full flex flex-col items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                      Traditional Lending
                    </h3>
                    <div className="space-y-3">
                      {problems.map((problem, index) => {
                        const Icon = problem.icon;
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-3 text-left"
                          >
                            <Icon className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                            <div>
                              <div className="font-semibold text-foreground">
                                {problem.title}
                              </div>
                              <div className="text-sm text-foreground/60">
                                {problem.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* zkLend Side (Right) */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-trust-green/5 to-violet-500/5"
                style={{
                  clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                }}
              >
                <div className="h-full flex flex-col items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-trust-green/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-trust-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-trust-green mb-4">
                      zkLend Solution
                    </h3>
                    <div className="space-y-3">
                      {solutions.map((solution, index) => {
                        const Icon = solution.icon;
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-3 text-left"
                          >
                            <Icon
                              className={`w-5 h-5 ${solution.color} flex-shrink-0 mt-1`}
                            />
                            <div>
                              <div className="font-semibold text-foreground">
                                {solution.title}
                              </div>
                              <div className="text-sm text-foreground/60">
                                {solution.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-blue-500 pointer-events-none z-10"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center shadow-lg pointer-events-auto cursor-ew-resize">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Slider Instruction */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full border border-border/30 text-sm font-medium pointer-events-none">
              Drag to compare
            </div>
          </div>
        </motion.div>

        {/* Impact Metrics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center p-6 rounded-xl bg-surface-1 border border-border/30 hover:bg-surface-2 transition-colors"
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className={`text-4xl font-bold ${solution.color} mb-2`}>
                {solution.impact}
              </div>
              <div className="text-sm text-foreground/60">{solution.title}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}