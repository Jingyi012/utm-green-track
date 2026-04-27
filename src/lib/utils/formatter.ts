import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export function formatNumber(value: number | undefined | null): string {
  return (value ?? 0).toFixed(2);
}

export const toPascalCase = (str: string) =>
  str
    .toLowerCase()
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

export const dateFormatter = (date?: string | null) => {
  if (!date) {
    return '-';
  }

  const normalized = date.trim();
  const parsed = dayjs(normalized, 'YYYY-MM-DD', true).isValid()
    ? dayjs(normalized, 'YYYY-MM-DD', true)
    : dayjs(normalized, 'DD/MM/YYYY', true).isValid()
      ? dayjs(normalized, 'DD/MM/YYYY', true)
      : dayjs(normalized);

  if (!parsed.isValid()) {
    return '-';
  }

  return parsed.tz('Asia/Kuala_Lumpur').format('DD/MM/YYYY');
};

export const dateTimeFormatter = (date?: string | Date | null): string => {
  if (!date) {
    return '-';
  }

  try {
    if (typeof date === 'string') {
      const normalized = date.trim();
      if (!normalized || normalized === '-' || normalized.toLowerCase() === 'null') {
        return '-';
      }

      const parsed = dayjs(normalized);
      if (!parsed.isValid()) {
        return '-';
      }

      return parsed.tz('Asia/Kuala_Lumpur').format('DD MMM YYYY, h:mm A');
    }

    const parsed = dayjs(date);
    if (!parsed.isValid()) {
      return '-';
    }

    return parsed.tz('Asia/Kuala_Lumpur').format('DD MMM YYYY, h:mm A');
  } catch {
    return '-';
  }
};
