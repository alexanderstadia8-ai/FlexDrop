export const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'SEK', symbol: 'kr', label: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', label: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', label: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', label: 'Polish Zloty' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', label: 'Mexican Peso' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', label: 'Hong Kong Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
]

// Zero-decimal currencies (Stripe needs amount in smallest unit differently)
export const ZERO_DECIMAL = ['JPY', 'KRW', 'VND']

export function toStripeAmount(amount: number, currency: string): number {
  if (ZERO_DECIMAL.includes(currency.toUpperCase())) return Math.round(amount)
  return Math.round(amount * 100)
}

export function fromStripeAmount(amount: number, currency: string): number {
  if (ZERO_DECIMAL.includes(currency.toUpperCase())) return amount
  return amount / 100
}

export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount)
}

// Rough EUR conversion rates for leaderboard sorting (updated periodically)
export const EUR_RATES: Record<string, number> = {
  EUR: 1,
  USD: 0.93,
  GBP: 1.17,
  CHF: 1.05,
  JPY: 0.006,
  CAD: 0.69,
  AUD: 0.61,
  SEK: 0.088,
  NOK: 0.088,
  DKK: 0.134,
  PLN: 0.23,
  BRL: 0.18,
  MXN: 0.054,
  SGD: 0.69,
  HKD: 0.12,
  INR: 0.011,
}

export function toEUR(amount: number, currency: string): number {
  return amount * (EUR_RATES[currency] ?? 1)
}
