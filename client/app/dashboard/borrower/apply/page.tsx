"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, CreditCard, X, CheckCircle2, Loader2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  AnonAadhaarProof,
} from "@anon-aadhaar/react";
import { useProver } from "@anon-aadhaar/react";
import { useUserRole } from "../../../../stores/user-store";
import { getCreditScore } from "../../../actions/getCreditScore";
import { useZkPassProofGen, getAttestation as getZkPassAttestation } from "../../../../hooks/use-proof/zkPass";
import { useAttestationRegistryProgram as getProgram } from "../../../../hooks/use-get-program";
import { useReclaimProofGenPlaid, getAttestation as getReclaimAttestation } from "../../../../hooks/use-proof/reclaim";
import { zkPassIssuerPubkey, plaidIssuerPubkey } from "../../../../lib/constants/issuers";
import { CreateLoanForm, CreditData } from "../../../../components/borrower/CreateLoanForm";

export default function Apply() {
  const { role, isLoading } = useUserRole();
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  const router = useRouter();
  const program = getProgram();

  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [zkPassAttestation, setZkPassAttestation] = useState<any>(null);
  const [reclaimAttestation, setReclaimAttestation] = useState<any>(null);
  const [zkPassLoading, setZkPassLoading] = useState(false);
  const [reclaimLoading, setReclaimLoading] = useState(false);
  const [zkPassResult, setZkPassResult] = useState<any>(null);
  const [reclaimResult, setReclaimResult] = useState<any>(null);
  const [proofsLoading, setProofsLoading] = useState(true);
  const [anonAadhaarStatus, setAnonAadhaarStatus] = useState<string>('not-logged-in');
  const [anonAadhaarExpiry, setAnonAadhaarExpiry] = useState<number | null>(null);

  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();

  useEffect(() => {
    const storedStatus = localStorage.getItem('anonAadhaarStatus');
    const storedExpiry = localStorage.getItem('anonAadhaarExpiry');

    if (storedStatus && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      if (Date.now() < expiryTime) {
        setAnonAadhaarStatus(storedStatus);
        setAnonAadhaarExpiry(expiryTime);
      } else {
        localStorage.removeItem('anonAadhaarStatus');
        localStorage.removeItem('anonAadhaarExpiry');
      }
    }
  }, []);

  useEffect(() => {
    if (anonAadhaar?.status === 'logged-in' && latestProof) {
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('anonAadhaarStatus', 'logged-in');
      localStorage.setItem('anonAadhaarExpiry', expiryTime.toString());
      setAnonAadhaarStatus('logged-in');
      setAnonAadhaarExpiry(expiryTime);
    }
  }, [anonAadhaar?.status, latestProof]);

  useEffect(() => {
    if (!isLoading && role && role !== "borrower") {
      router.push("/onboarding");
    }
  }, [isLoading, role, router]);


  useEffect(() => {
    if (!connected || !publicKey) {
      setProofsLoading(false);
      return;
    }

    (async () => {
      setProofsLoading(true);
      const creditData = await getCreditScore(publicKey.toBase58());
      if (creditData !== null) setCreditData(creditData);

      const [zkPassAttestation, reclaimAttestation] = await Promise.all([
        getZkPassAttestation({ address: publicKey.toBase58(), program: program! }),
        getReclaimAttestation({ address: publicKey.toBase58(), program: program! })
      ]);

      setZkPassAttestation(zkPassAttestation);
      setReclaimAttestation(reclaimAttestation);
      setProofsLoading(false);
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

  if (!connected || !publicKey || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground/70">
          Please connect your wallet to access this page.
        </p>
      </div>
    );
  }

  if (proofsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleCloseModal = () => {
    setActiveModal(null);
    const storedStatus = localStorage.getItem('anonAadhaarStatus');
    const storedExpiry = localStorage.getItem('anonAadhaarExpiry');
    if (storedStatus) {
      setAnonAadhaarStatus(storedStatus);
    }
    if (storedExpiry) {
      setAnonAadhaarExpiry(parseInt(storedExpiry, 10));
    }
  };

  if (!creditData) {
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
                CrediSol - Apply
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-neutral-800 text-white text-sm font-medium rounded-full shadow">
                Credit Score:{" "}
                <span className="font-bold ml-1">{creditData?.score}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard/borrower")}
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className={`w-full p-6 rounded-xl text-left border transition-all backdrop-blur-md ${anonAadhaarStatus === 'logged-in'
              ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-green-500/10 cursor-default'
              : 'border-border/30 bg-gradient-to-br from-violet-500/5 to-blue-500/5 hover:from-violet-500/10 hover:to-blue-500/10 cursor-pointer hover:border-violet-500/50'}`}
            onClick={() => anonAadhaarStatus !== 'logged-in' && setActiveModal("anon")}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {anonAadhaarStatus === 'logged-in' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Shield className="w-5 h-5 text-violet-400" />
                  )}
                  <span className="font-semibold text-foreground">
                    {anonAadhaarStatus === 'logged-in' ? 'Anon Aadhaar Verified' : 'Generate Anon Aadhaar Proofs'}
                  </span>
                </div>
                <p className="text-sm text-foreground/70">
                  {anonAadhaarStatus === 'logged-in' && anonAadhaarExpiry
                    ? `Expires ${new Date(anonAadhaarExpiry).toLocaleDateString()}`
                    : 'Generate anonymous Aadhaar verification proofs for loan applications.'}
                </p>
              </div>
              {anonAadhaarStatus === 'logged-in' ? (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    Active
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              ) : (
                <ArrowRight className="w-5 h-5 text-foreground/50" />
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            onClick={() => !zkPassAttestation?.isValid && setActiveModal("zkpass")}
            className={`w-full p-6 rounded-xl text-left border transition-all text-foreground backdrop-blur-md ${zkPassAttestation?.isValid
              ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-green-500/10 cursor-default'
              : 'border-border/30 bg-gradient-to-br from-blue-400/5 to-emerald-400/5 hover:from-blue-400/10 hover:to-emerald-400/10 cursor-pointer hover:border-blue-500/50'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {zkPassAttestation?.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  )}
                  <span className="font-semibold text-foreground">
                    {zkPassLoading ? 'Verifying...' : zkPassAttestation?.isValid ? 'zkPass Verified' : 'Verify with zkPass'}
                  </span>
                </div>
                <p className="text-sm text-foreground/70">
                  {zkPassAttestation?.isValid
                    ? `Verified on ${new Date(zkPassAttestation.issuedAt).toLocaleDateString()} • Expires ${new Date(zkPassAttestation.expiryTs).toLocaleDateString()}`
                    : 'Securely verify your information using zkPass.'
                  }
                </p>
              </div>
              {zkPassLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
              ) : zkPassAttestation?.isValid ? (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    Active
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              ) : (
                <ArrowRight className="w-5 h-5 text-foreground/50" />
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            onClick={() => !reclaimAttestation?.isValid && setActiveModal("reclaim")}
            className={`w-full p-6 rounded-xl text-left border transition-all backdrop-blur-md ${reclaimAttestation?.isValid
              ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-green-500/10 cursor-default'
              : 'border-border/30 bg-gradient-to-br from-teal-400/5 to-emerald-400/5 hover:from-teal-400/10 hover:to-emerald-400/10 cursor-pointer hover:border-teal-500/50'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {reclaimAttestation?.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-teal-400" />
                  )}
                  <span className="font-semibold text-foreground">
                    {reclaimLoading ? 'Verifying...' : reclaimAttestation?.isValid ? 'Reclaim Verified' : 'Verify with Reclaim'}
                  </span>
                </div>
                <p className="text-sm text-foreground/70">
                  {reclaimAttestation?.isValid
                    ? `Verified on ${new Date(reclaimAttestation.issuedAt).toLocaleDateString()} • Expires ${new Date(reclaimAttestation.expiryTs).toLocaleDateString()}`
                    : 'Securely verify your information using Reclaim Protocol.'
                  }
                </p>
              </div>
              {reclaimLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
              ) : reclaimAttestation?.isValid ? (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    Active
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              ) : (
                <ArrowRight className="w-5 h-5 text-foreground/50" />
              )}
            </div>
          </motion.div>

          <div className="text-center pt-4 text-sm text-foreground/70 mb-8">
            Your current credit score:{" "}
            <span className="font-semibold text-foreground">{creditData?.score}</span>
          </div>

          <motion.div
            variants={itemVariants}
            className="w-full p-6 rounded-xl border border-border/30 bg-background/80 backdrop-blur-md"
          >
            <CreateLoanForm
              isVerified={
                zkPassAttestation?.isValid &&
                reclaimAttestation?.isValid
              }
              creditData={creditData}
            />
          </motion.div>
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
            onClick={handleCloseModal}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative rounded-2xl p-6 w-[40%] max-w-2xl min-h-[800px] max-h-[90vh] bg-background/80 border border-border/40 shadow-2xl backdrop-blur-md overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            >
              <div className="relative flex items-center justify-center pb-3 border-b border-border/50">
                <h2 className="text-2xl font-semibold text-foreground text-center">
                  {activeModal === "anon" && "Generate Anon Aadhaar Proofs"}
                  {activeModal === "zkpass" && "Generate ZK Pass Proofs"}
                  {activeModal === "reclaim" && "Generate Reclaim Proofs"}
                </h2>

                <button
                  className="absolute right-0 text-foreground/50 hover:text-foreground text-xl"
                  onClick={handleCloseModal}
                >
                  <X className="w-5 h-5 cursor-pointer" />
                </button>
              </div>
              {activeModal === "anon" && (
                <div className="flex flex-col justify-start items-center w-full space-y-5 pb-4 mt-1">
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
                <div className="space-y-5 flex flex-col items-center">
                  <p className="text-sm text-foreground/70 mt-2">
                    Create a zero-knowledge proof using zkPass for privacy-preserving verification.
                  </p>

                  {!zkPassResult ? (
                    <button
                      className="w-full py-3 rounded-lg border border-border text-foreground font-medium backdrop-blur-md bg-background/50 hover:bg-background/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      onClick={async () => {
                        setZkPassLoading(true);
                        try {
                          const result = await useZkPassProofGen({ address: publicKey?.toBase58()!, program });
                          setZkPassResult(result);
                          if (result && result.success) {
                            const attestation = await getZkPassAttestation({
                              address: publicKey.toBase58(),
                              program,
                              issuerPubkey: zkPassIssuerPubkey
                            });
                            setZkPassAttestation(attestation);
                          }
                        } finally {
                          setZkPassLoading(false);
                        }
                      }}
                      disabled={zkPassLoading}
                    >
                      {zkPassLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {zkPassLoading ? 'Generating Proof...' : 'Generate Proof'}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {zkPassResult.success ? (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-emerald-400">Proof Generated Successfully!</h3>
                              <div className="text-sm text-foreground/70 space-y-1">
                                <p className="break-all">
                                  <span className="font-medium text-foreground">Transaction:</span>{' '}
                                  <a
                                    href={`https://explorer.solana.com/tx/${zkPassResult.signature}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                  >
                                    {zkPassResult.signature?.slice(0, 8)}...{zkPassResult.signature?.slice(-8)}
                                  </a>
                                </p>
                                <p className="break-all">
                                  <span className="font-medium text-foreground">Attestation PDA:</span>{' '}
                                  <span className="text-emerald-400">{zkPassResult.attestationPda}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                          <div className="flex items-start gap-3">
                            <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-red-400">Proof Generation Failed</h3>
                              <p className="text-sm text-foreground/70 mt-1">
                                {zkPassResult.error?.message || 'An error occurred while generating the proof.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <button
                        className="w-full py-2 rounded-lg border border-border text-foreground text-sm font-medium backdrop-blur-md bg-background/50 hover:bg-background/70 transition-colors"
                        onClick={() => {
                          setZkPassResult(null);
                          if (zkPassResult.success) {
                            setActiveModal(null);
                          }
                        }}
                      >
                        {zkPassResult.success ? 'Close' : 'Try Again'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeModal === "reclaim" && (
                <div className="space-y-5 flex flex-col items-center">
                  <p className="text-sm text-foreground/70 mt-2">
                    Securely fetch your financial data from Plaid or CreditKarma to generate proofs.
                  </p>

                  {!reclaimResult ? (
                    <button
                      className="w-full py-3 rounded-lg border border-border text-foreground font-medium backdrop-blur-md bg-background/50 hover:bg-background/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      onClick={async () => {
                        setReclaimLoading(true);
                        try {
                          const result = await useReclaimProofGenPlaid({
                            address: publicKey?.toBase58()!,
                            program
                          });
                          setReclaimResult(result);
                          if (result && result.success) {
                            const attestation = await getReclaimAttestation({
                              address: publicKey?.toBase58()!,
                              program,
                              issuerPubkey: plaidIssuerPubkey
                            });
                            setReclaimAttestation(attestation);
                          }
                        } finally {
                          setReclaimLoading(false);
                        }
                      }}
                      disabled={reclaimLoading}
                    >
                      {reclaimLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {reclaimLoading ? 'Generating Proof...' : 'Generate Proof'}
                    </button>
                  ) : (
                    <div className="space-y-4 w-full">
                      {reclaimResult.success ? (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-emerald-400">Proof Generated Successfully!</h3>
                              <div className="text-sm text-foreground/70 space-y-1">
                                <p className="break-all">
                                  <span className="font-medium text-foreground">Transaction:</span>{' '}
                                  <a
                                    href={`https://explorer.solana.com/tx/${reclaimResult.signature}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                  >
                                    {reclaimResult.signature?.slice(0, 8)}...{reclaimResult.signature?.slice(-8)}
                                  </a>
                                </p>
                                <p className="break-all">
                                  <span className="font-medium text-foreground">Attestation PDA:</span>{' '}
                                  <span className="text-emerald-400">{reclaimResult.attestationPda}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                          <div className="flex items-start gap-3">
                            <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-red-400">Proof Generation Failed</h3>
                              <p className="text-sm text-foreground/70 mt-1">
                                {reclaimResult.error || 'An error occurred while generating the proof.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <button
                        className="w-full py-2 rounded-lg border border-border text-foreground text-sm font-medium backdrop-blur-md bg-background/50 hover:bg-background/70 transition-colors"
                        onClick={() => {
                          setReclaimResult(null);
                          if (reclaimResult?.success) {
                            setActiveModal(null);
                            if (publicKey) {
                              getCreditScore(publicKey.toBase58()).then(data => {
                                if (data !== null) setCreditData(data);
                              });
                            }
                          }
                        }}
                      >
                        {reclaimResult.success ? 'Close' : 'Try Again'}
                      </button>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-foreground/70 text-center">
                    Current Credit Score: <span className="font-semibold text-foreground">{creditData?.score}</span>
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
