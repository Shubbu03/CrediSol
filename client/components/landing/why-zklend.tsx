"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Lock,
  Cpu,
  CheckCircle,
  TrendingUp,
  Users,
  Activity,
  Award,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function WhyZkLend() {
  const [activeTab, setActiveTab] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState({
    tps: 0,
    uptime: 0,
    users: 0,
  });

  useEffect(() => {
    const targets = { tps: 65000, uptime: 99.9, users: 2847 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setLiveMetrics({
        tps: Math.floor(targets.tps * progress),
        uptime: Number((targets.uptime * progress).toFixed(1)),
        users: Math.floor(targets.users * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setLiveMetrics(targets);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Zero-Knowledge Privacy",
      description: "Prove creditworthiness without revealing data",
      color: "from-violet-500 to-purple-500",
      stats: [
        { label: "Privacy Level", value: "100%" },
        { label: "Proof Size", value: "< 1KB" },
        { label: "Verification", value: "< 100ms" },
      ],
      benefits: [
        "Financial data stays on your device",
        "ZK proofs generated locally",
        "No central database of personal info",
        "Mathematically guaranteed privacy",
      ],
    },
    {
      icon: Zap,
      title: "Solana Speed",
      description: "Lightning-fast transactions at minimal cost",
      color: "from-blue-500 to-cyan-500",
      stats: [
        { label: "TPS", value: "65,000+" },
        { label: "Finality", value: "< 400ms" },
        { label: "Cost", value: "< $0.001" },
      ],
      benefits: [
        "Sub-second transaction finality",
        "Micro-fee structure",
        "High throughput capacity",
        "No network congestion",
      ],
    },
    {
      icon: Cpu,
      title: "Smart Contract Security",
      description: "Battle-tested with formal verification",
      color: "from-emerald-500 to-teal-500",
      stats: [
        { label: "Security", value: "High" },
        { label: "Coverage", value: "100%" },
        { label: "Uptime", value: "99.9%" },
      ],
      benefits: [
        "Formally verified contracts",
        "Multi-signature governance",
        "Time-locked upgrades",
        "Emergency pause mechanisms",
      ],
    },
    {
      icon: Lock,
      title: "Decentralized Architecture",
      description: "No single point of failure",
      color: "from-orange-500 to-red-500",
      stats: [
        { label: "Validators", value: "2,000+" },
        { label: "Decentralization", value: "100%" },
        { label: "Governance", value: "DAO" },
      ],
      benefits: [
        "Distributed across Solana validators",
        "No central authority",
        "Community governance",
        "Open source codebase",
      ],
    },
  ];

  const trustIndicators = [
    {
      icon: Shield,
      title: "Security",
      value: "Enterprise",
      status: "Protected",
      color: "text-violet-500",
    },
    {
      icon: Users,
      title: "Active Users",
      value: liveMetrics.users.toLocaleString(),
      status: "Growing",
      color: "text-violet-500",
    },
    {
      icon: Activity,
      title: "Network Health",
      value: `${liveMetrics.uptime}%`,
      status: "Excellent",
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      title: "Success Rate",
      value: "99.2%",
      status: "Industry Leading",
      color: "text-trust-green",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background">
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
            <CheckCircle className="w-4 h-4 text-trust-green" />
            <span className="text-sm font-medium">Built to Last</span>
          </motion.div>
          <h2 className="text-heading-1 mb-4">
            Why <span className="gradient-text">zkLend</span> Works
          </h2>
          <p className="text-body-large text-foreground/60 max-w-2xl mx-auto">
            Cutting-edge technology meets financial innovation. Here's what makes us different.
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {trustIndicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 rounded-xl bg-surface-1 border border-border/30 hover:bg-surface-2 transition-colors"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Icon className={`w-8 h-8 ${indicator.color} mx-auto mb-3`} />
                <div className={`text-2xl font-bold ${indicator.color} mb-1 tabular-nums`}>
                  {indicator.value}
                </div>
                <div className="text-sm font-medium text-foreground mb-1">
                  {indicator.title}
                </div>
                <div className="text-xs text-foreground/60">{indicator.status}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Feature Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.button
                key={index}
                variants={itemVariants}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === index
                    ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg"
                    : "bg-surface-1 text-foreground/70 hover:bg-surface-2 hover:text-foreground"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{feature.title}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Active Feature Details */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Feature Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${features[activeTab].color} flex items-center justify-center mb-6`}
              >
                {(() => {
                  const Icon = features[activeTab].icon;
                  return <Icon className="w-8 h-8 text-white" />;
                })()}
              </div>
              <h3 className="text-3xl font-bold mb-3">
                {features[activeTab].title}
              </h3>
              <p className="text-lg text-foreground/60">
                {features[activeTab].description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {features[activeTab].benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-trust-green flex-shrink-0" />
                  <span className="text-foreground/70">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Technical Specs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-2xl p-8 border border-border/30">
              <h4 className="text-xl font-semibold mb-6">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {features[activeTab].stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center p-4 bg-background/50 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1 tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-xs text-foreground/60">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Live Demo Placeholder */}
            <div className="bg-gradient-to-br from-trust-green/5 to-emerald-500/5 rounded-2xl p-8 border border-border/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Live Network Status</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-trust-green rounded-full animate-pulse" />
                  <span className="text-sm text-trust-green">Operational</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Transactions/sec</span>
                  <span className="text-lg font-bold tabular-nums">
                    {liveMetrics.tps.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Network Uptime</span>
                  <span className="text-lg font-bold text-trust-green tabular-nums">
                    {liveMetrics.uptime}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Active Participants</span>
                  <span className="text-lg font-bold tabular-nums">
                    {liveMetrics.users.toLocaleString()}+
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}