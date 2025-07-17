export function formatNumber(value: number | undefined | null): string {
    return (value ?? 0).toFixed(2);
}

export const toPascalCase = (str: string) =>
    str
        .toLowerCase()
        .split(/[\s_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');