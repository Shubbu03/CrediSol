'use server'

export async function getCreditScore(address: string) {
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
        return data.totalScore;
    } catch (err) {
        console.error("Failed to fetch credit score:", err);
        return null;
    }
}