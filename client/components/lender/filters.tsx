"use client";

import { useLoanFiltersStore } from "../../hooks/use-loans";
import { motion } from "framer-motion";

export function LoanFilters() {
    const { termMonths, minAprBps, minScore, setFilters } = useLoanFiltersStore();

    return (
        <div className="p-4 bg-surface-1 rounded-xl border border-border/30 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
                label="Term"
                value={termMonths?.toString() ?? ""}
                onChange={(v) => setFilters({ termMonths: v ? Number(v) : undefined })}
                options={[
                    { label: "Any", value: "" },
                    { label: "3 mo", value: "3" },
                    { label: "6 mo", value: "6" },
                    { label: "12 mo", value: "12" },
                ]}
            />
            <Select
                label="Min APR"
                value={minAprBps?.toString() ?? ""}
                onChange={(v) => setFilters({ minAprBps: v ? Number(v) : undefined })}
                options={[
                    { label: "Any", value: "" },
                    { label: "10%", value: "1000" },
                    { label: "12%", value: "1200" },
                    { label: "13%", value: "1300" },
                ]}
            />
            <Select
                label="Min Score"
                value={minScore?.toString() ?? ""}
                onChange={(v) => setFilters({ minScore: v ? Number(v) : undefined })}
                options={[
                    { label: "Any", value: "" },
                    { label: "700", value: "700" },
                    { label: "750", value: "750" },
                    { label: "800", value: "800" },
                ]}
            />
        </div>
    );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
    return (
        <label className="text-sm">
            <div className="text-foreground/60 mb-1">{label}</div>
            <motion.select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 pr-8 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-trust-green/40 appearance-none cursor-pointer"
                whileFocus={{ scale: 1.01 }}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                }}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </motion.select>
        </label>
    );
}
