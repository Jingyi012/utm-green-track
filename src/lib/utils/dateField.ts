import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const parseDateValue = (value: unknown): Dayjs | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value : undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) {
      return undefined;
    }

    const supportedFormats = [
      'YYYY-MM-DD',
      'DD/MM/YYYY',
      'YYYY-MM-DDTHH:mm:ssZ',
      'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
    ];

    for (const format of supportedFormats) {
      const parsed = dayjs(normalized, format, true);
      if (parsed.isValid()) {
        return parsed;
      }
    }

    const fallbackParsed = dayjs(normalized);
    return fallbackParsed.isValid() ? fallbackParsed : undefined;
  }

  if (typeof value === 'number' || value instanceof Date) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : undefined;
  }

  return undefined;
};

export const toPickerDateValue = (value?: string | Date | null): Dayjs | undefined => {
  return parseDateValue(value);
};

export const toIsoDateTimeString = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    !(value instanceof Date) &&
    !dayjs.isDayjs(value)
  ) {
    return undefined;
  }

  const parsed = parseDateValue(value);
  return parsed?.isValid() ? parsed.format('YYYY-MM-DD[T]HH:mm:ssZ') : undefined;
};

export const toDateOnlyString = (value: unknown): string | undefined => {
  const parsed = parseDateValue(value);
  return parsed?.isValid() ? parsed.format('YYYY-MM-DD') : undefined;
};
