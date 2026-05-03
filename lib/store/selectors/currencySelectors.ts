import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const selectCurrencyState = (state: RootState) => state.currency;

/** All raw FX rates from the API */
export const selectRates = createSelector(
  [selectCurrencyState],
  (currency) => currency.rates
);

/** The currently selected dashboard currency code */
export const selectSelectedCurrency = createSelector(
  [selectCurrencyState],
  (currency) => currency.selectedCurrency
);

/** Loading state for currency slice */
export const selectCurrencyLoading = createSelector(
  [selectCurrencyState],
  (currency) => currency.loading
);

/** Error state for currency slice */
export const selectCurrencyError = createSelector(
  [selectCurrencyState],
  (currency) => currency.error
);

/**
 * Memoized FX rate table: currencies filtered to exclude the base, mapped
 * to { code, flag, rate } — display-ready, no formatting in component.
 */
const CURRENCY_META: Record<string, { flag: string }> = {
  USD: { flag: '🇺🇸' }, EUR: { flag: '🇪🇺' }, GBP: { flag: '🇬🇧' },
  JPY: { flag: '🇯🇵' }, INR: { flag: '🇮🇳' }, AUD: { flag: '🇦🇺' },
  CAD: { flag: '🇨🇦' }, CHF: { flag: '🇨🇭' }, SGD: { flag: '🇸🇬' },
};

const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_META);

export interface RateRow {
  code: string;
  flag: string;
  rateFormatted: string; // e.g. "1.0842"
}

export const selectRateTable = createSelector(
  [selectRates],
  (rates): RateRow[] => {
    if (!rates) return [];
    return SUPPORTED_CURRENCIES
      .filter((c) => c !== rates.base)
      .map((c) => ({
        code: c,
        flag: CURRENCY_META[c]?.flag ?? '',
        rateFormatted: rates.rates[c] != null ? rates.rates[c].toFixed(4) : '—',
      }));
  }
);

/**
 * Converted amount: given fromAmount (string), fromCurrency, toCurrency,
 * computes the formatted result string using live rates.
 */
interface ConversionInput {
  fromAmount: string;
  fromCurrency: string;
  toCurrency: string;
}

export const selectConvertedAmount = createSelector(
  [selectRates, (_state: RootState, input: ConversionInput) => input],
  (rates, { fromAmount, fromCurrency, toCurrency }): string => {
    if (!rates || !fromAmount) return '—';
    const amount = parseFloat(fromAmount);
    if (isNaN(amount)) return '—';
    const fromRate = rates.rates[fromCurrency] ?? 1;
    const toRate = rates.rates[toCurrency] ?? 1;
    const result = (amount / fromRate) * toRate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: toCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(result);
  }
);

/** Last-updated timestamp formatted for display */
export const selectRatesLastUpdated = createSelector(
  [selectRates],
  (rates): string => {
    if (!rates) return '';
    return new Date(rates.lastUpdated).toLocaleTimeString();
  }
);

export { SUPPORTED_CURRENCIES, CURRENCY_META };
