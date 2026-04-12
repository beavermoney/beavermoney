// Hardcoded currency list. Must match backend (internal/currencies/currencies.go).
// ISO 4217 codes — this list changes extremely rarely.

export interface CurrencyInfo {
  code: string
  locales: string[]
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', locales: ['en-US'] },
  { code: 'EUR', locales: ['de-DE', 'fr-FR', 'es-ES', 'it-IT', 'nl-NL'] },
  { code: 'GBP', locales: ['en-GB'] },
  { code: 'JPY', locales: ['ja-JP'] },
  { code: 'CNY', locales: ['zh-CN'] },
  { code: 'CAD', locales: ['en-CA', 'fr-CA'] },
  { code: 'AUD', locales: ['en-AU'] },
  { code: 'KRW', locales: ['ko-KR'] },
  { code: 'INR', locales: ['en-IN', 'hi-IN'] },
  { code: 'BRL', locales: ['pt-BR'] },
]

const byCode = new Map(SUPPORTED_CURRENCIES.map((c) => [c.code, c]))

export function lookupCurrency(code: string): CurrencyInfo | undefined {
  return byCode.get(code)
}

export function isValidCurrency(code: string): boolean {
  return byCode.has(code)
}

export function currencyCodes(): string[] {
  return SUPPORTED_CURRENCIES.map((c) => c.code)
}
