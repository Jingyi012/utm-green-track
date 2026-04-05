import { MONTH_LABELS_SHORT } from '@/lib/enum/monthName';

const numberFormatter = new Intl.NumberFormat('en-MY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('en-MY', {
  maximumFractionDigits: 0,
});

export function formatFixed(value: number): string {
  return numberFormatter.format(value ?? 0);
}

export function formatTonnes(value: number): string {
  return `${formatFixed(value)} tonnes`;
}

export function formatKilograms(value: number): string {
  return `${formatFixed(value)} kg`;
}

export function formatCurrency(value: number): string {
  return `RM ${formatFixed(value)}`;
}

export function formatPercent(value: number): string {
  return `${formatFixed(value)}%`;
}

export function formatPopulation(value: number): string {
  return integerFormatter.format(value ?? 0);
}

export function monthLabel(month: number): string {
  const index = Math.max(1, Math.min(month, 12)) - 1;
  return MONTH_LABELS_SHORT[index];
}
