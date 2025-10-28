export function termSecsToMonths(termSecs: number): number {
    const SECONDS_PER_MONTH = 30.44 * 24 * 60 * 60; // Average days per month * hours * minutes * seconds
    return Math.round((termSecs / SECONDS_PER_MONTH) * 10) / 10;
}

