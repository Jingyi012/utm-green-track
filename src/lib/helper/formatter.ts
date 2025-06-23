export function formatNumber(value: number | undefined | null): string {
    return (value ?? 0).toFixed(2);
}
