'use server'

export async function getCreditScore(address: string): Promise<{ 
    score: number;
    grade: number;
    pdBps: number 
} | null> {
    try {
        const res = await fetch("https://www.vettor.dev/api/wallet/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status} — ${text}`);
        }

        const data = await res.json() as any;
        return {
            score: data.totalScore,
            grade: data.totalScore > 700 ? 5 : data.totalScore > 500 ? 4 : data.totalScore > 350 ? 3 : data.totalScore > 200 ? 2 : 1,
            pdBps: Math.max(50, Math.min(5000, Math.floor((850 - data.totalScore) * 6))),
        };
    } catch (err) {
        console.error("Failed to fetch credit score:", err);
        return null;
    }
}