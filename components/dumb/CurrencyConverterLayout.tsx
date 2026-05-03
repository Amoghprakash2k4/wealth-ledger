import {
  SUPPORTED_CURRENCIES,
  CURRENCY_META,
  type RateRow,
} from '@/lib/store/selectors/currencySelectors';
import type { ExchangeRates } from '@/lib/store/slices/currencySlice';

interface CurrencyConverterLayoutProps {
  selectedCurrency: string;
  loading: boolean;
  error: string | null;
  rates: ExchangeRates | null;
  rateTable: RateRow[];
  lastUpdated: string;
  convertedAmount: string;
  fromAmount: string;
  fromCurrency: string;
  toCurrency: string;
  onFromAmountChange: (val: string) => void;
  onFromCurrencyChange: (val: string) => void;
  onToCurrencyChange: (val: string) => void;
  onBaseCurrencyChange: (currency: string) => void;
}

/**
 * DUMB COMPONENT: CurrencyConverter layout
 * All data pre-formatted by selectors, dispatching handled by parent smart component
 */
export function CurrencyConverterLayout({
  selectedCurrency,
  loading,
  error,
  rates,
  rateTable,
  lastUpdated,
  convertedAmount,
  fromAmount,
  fromCurrency,
  toCurrency,
  onFromAmountChange,
  onFromCurrencyChange,
  onToCurrencyChange,
  onBaseCurrencyChange,
}: CurrencyConverterLayoutProps) {
  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Currency Converter</h2>
          <p className="text-sm mt-0.5 text-text-muted">
            Live FX rates · affects portfolio values
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border-default">
          <div className={`w-2 h-2 rounded-full ${loading ? 'animate-pulse bg-accent-amber' : 'bg-accent-green'}`} />
          <span className="text-xs text-text-secondary">
            {loading ? 'Updating…' : rates ? 'Live' : 'No data'}
          </span>
        </div>
      </div>

      {/* Base currency selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">
          Dashboard Currency
        </label>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => onBaseCurrencyChange(c)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                selectedCurrency === c
                  ? 'currency-btn-active'
                  : 'currency-btn-inactive'
              }`}
            >
              <span>{CURRENCY_META[c]?.flag}</span>
              <span>{c}</span>
            </button>
          ))}
        </div>
        {lastUpdated && (
          <p className="text-xs mt-2 text-text-muted">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Amount converter */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">
          Amount Converter
        </label>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex flex-1 rounded-xl overflow-hidden border border-border-default">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => onFromAmountChange(e.target.value)}
              className="flex-1 px-4 py-3 text-white font-semibold outline-none text-lg bg-bg-elevated"
              placeholder="1000"
            />
            <select
              value={fromCurrency}
              onChange={(e) => onFromCurrencyChange(e.target.value)}
              className="px-3 py-3 font-medium outline-none cursor-pointer select-field"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>{CURRENCY_META[c]?.flag} {c}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg fx-swap-btn">
              ⇄
            </div>
          </div>

          <div className="flex flex-1 rounded-xl overflow-hidden border border-border-default">
            <div className="flex-1 px-4 py-3 font-bold text-lg truncate bg-bg-elevated text-accent-tertiary">
              {convertedAmount}
            </div>
            <select
              value={toCurrency}
              onChange={(e) => onToCurrencyChange(e.target.value)}
              className="px-3 py-3 font-medium outline-none cursor-pointer select-field"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>{CURRENCY_META[c]?.flag} {c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rate table */}
      {rateTable.length > 0 && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">
            Rates vs {rates?.base}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {rateTable.map(({ code, flag, rateFormatted }) => (
              <div key={code} className="rounded-lg px-3 py-2 text-center rate-cell">
                <p className="text-xs mb-0.5 text-text-muted">
                  {flag} {code}
                </p>
                <p className="text-sm font-semibold text-text-primary">
                  {rateFormatted}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm error-message">
          ⚠ {error} — showing last known values
        </div>
      )}
    </div>
  );
}
