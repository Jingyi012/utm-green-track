export function formatNumber(value: number | undefined | null): string {
    return (value ?? 0).toFixed(2);
}

export const toPascalCase = (str: string) =>
    str
        .toLowerCase()
        .split(/[\s_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

export const dateFormatter = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB')
}

export const dateTimeFormatter = (date: string | Date): string => {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleString();
};