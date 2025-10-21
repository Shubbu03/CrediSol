"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, CreditCard, X } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  AnonAadhaarProof,
} from "@anon-aadhaar/react";
import { useProver } from "@anon-aadhaar/react";
import { useUserRole } from "../../../../stores/user-store";
import { getCreditScore } from "../../../actions/getCreditScore";

export default function Apply() {
  const { role, isLoading } = useUserRole();
  const { connected, publicKey } = useWallet();
  const router = useRouter();

  const [creditScore, setCreditScore] = useState<string | number>('--');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();

  useEffect(() => {
    if (!isLoading && role && role !== "borrower") {
      router.push("/onboarding");
    }
  }, [isLoading, role, router]);


  useEffect(() => {
    if (!connected || !publicKey) return;

    (async () => {
      const score = await getCreditScore(publicKey.toBase58());
      if (score !== null) setCreditScore(score);
    })();
  }, [connected, publicKey]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground/70">
          Please connect your wallet to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                <span className="font-bold text-sm">zk</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                zkLend - Apply
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-neutral-800 text-white text-sm font-medium rounded-full shadow">
                Credit Score:{" "}
                <span className="font-bold ml-1">{creditScore}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -3, boxShadow: "0 8px 24px rgba(128, 90, 250, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal("anon")}
            className="w-full p-6 rounded-xl text-left border border-border/30 transition-all text-foreground backdrop-blur-md bg-gradient-to-br from-violet-500/5 to-blue-500/5 hover:from-violet-500/10 hover:to-blue-500/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <ArrowRight className="w-5 h-5 text-violet-400" />
              <span className="font-semibold text-foreground">
                Generate Anon Aadhar Proofs
              </span>
            </div>
            <p className="text-sm text-foreground/70">
              Generate anonymous Aadhar verification proofs for loan applications.
            </p>
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -3, boxShadow: "0 8px 24px rgba(0, 186, 255, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal("zkpass")}
            className="w-full p-6 rounded-xl text-left border border-border/30 transition-all text-foreground backdrop-blur-md bg-gradient-to-br from-blue-400/5 to-emerald-400/5 hover:from-blue-400/10 hover:to-emerald-400/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-foreground">
                Generate zkPass Proofs
              </span>
            </div>
            <p className="text-sm text-foreground/70">
              Generate zero-knowledge proofs via zkPass for private verification.
            </p>
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -3, boxShadow: "0 8px 24px rgba(52, 211, 153, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal("reclaim")}
            className="w-full p-6 rounded-xl text-left border border-border/30 transition-all text-foreground backdrop-blur-md bg-gradient-to-br from-green-400/5 to-emerald-500/5 hover:from-green-400/10 hover:to-emerald-500/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-foreground">
                Reclaim Plaid & CreditKarma Proofs
              </span>
            </div>
            <p className="text-sm text-foreground/70">
              Recover financial data to prove creditworthiness.
            </p>
          </motion.button>

          <div className="text-center pt-4 text-sm text-foreground/70">
            Your current credit score:{" "}
            <span className="font-semibold text-foreground">{creditScore}</span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            key="modal"
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative rounded-2xl p-8 w-[50%] h-[85%] bg-background/80 border border-border/40 shadow-2xl backdrop-blur-md overflow-y-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            >
              <div className="relative flex items-center justify-center pb-3 border-b border-border/50">
                <h2 className="text-2xl font-semibold text-foreground text-center">
                  {activeModal === "anon" && "Generate Anon Aadhaar Proofs"}
                  {activeModal === "zkpass" && "Generate ZK Pass Proofs"}
                  {activeModal === "reclaim" && "Reclaim Financial Proofs"}
                </h2>

                <button
                  className="absolute right-0 text-foreground/50 hover:text-foreground text-xl"
                  onClick={() => setActiveModal(null)}
                >
                  <X className="w-5 h-5 cursor-pointer" />
                </button>
              </div>
              {activeModal === "anon" && (
                <div className="flex flex-col justify-center items-center h-full w-full space-y-5">
                  <p className="text-sm text-foreground/70 text-center">
                    Verify your Aadhaar credentials without revealing your identity.
                  </p>

                  <div className="flex flex-col items-center space-y-2">
                    <LogInWithAnonAadhaar
                      nullifierSeed={Number(process.env.NEXT_PUBLIC_ANON_AADHAAR_NULLIFIER)}
                      fieldsToReveal={["revealAgeAbove18", "revealPinCode"]}
                    />

                    <p className="text-sm text-foreground/70 text-center">
                      Status: {anonAadhaar?.status ?? "Not logged in"}
                    </p>
                  </div>

                  {anonAadhaar?.status === "logged-in" && latestProof && (
                    <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
                  )}
                </div>
              )}
              {activeModal === "zkpass" && (
                <div className="space-y-5">
                  <p className="text-sm text-foreground/70">
                    Create a zero-knowledge proof using zkPass for privacy-preserving verification.
                  </p>

                  <button className="w-full py-3 rounded-lg border border-border text-foreground font-medium backdrop-blur-md bg-background/50 hover:bg-background/70 transition-colors">
                    Generate Proof
                  </button>
                </div>
              )}

              {activeModal === "reclaim" && (
                <div className="space-y-5">
                  <p className="text-sm text-foreground/70">
                    Securely fetch your financial data from Plaid or CreditKarma to generate proofs.
                  </p>

                  <button className="w-full py-3 rounded-lg border border-border text-foreground font-medium backdrop-blur-md bg-background/50 hover:bg-background/70 transition-colors">
                    Reclaim Data
                  </button>

                  <div className="mt-4 text-sm text-foreground/70 text-center">
                    Current Credit Score: <span className="font-semibold text-foreground">{creditScore}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
