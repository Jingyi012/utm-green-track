import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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
    const d = dayjs.tz(date, 'Asia/Kuala_Lumpur');

    if (!d.isValid()) {
        return "-";
    }

    return d.format('DD MMM YYYY, h:mm A');
};