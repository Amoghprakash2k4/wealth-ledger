'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { setSelectedCurrency, fetchRates } from '@/lib/store/slices/currencySlice';
import {
  selectSelectedCurrency,
  selectCurrencyLoading,
  selectCurrencyError,
  selectRates,
  selectRateTable,
  selectConvertedAmount,
  selectRatesLastUpdated,
} from '@/lib/store/selectors/currencySelectors';

import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store/store';
import { CurrencyConverterLayout } from '../dumb/CurrencyConverterLayout';

/**
 * SMART COMPONENT: Multi-currency Converter (FEATURE 04)
 * - No derived state in component — all calculations in createSelector
 * - Dispatches setSelectedCurrency → currencySlice + portfolioSlice react (cross-slice)
 * - fetchRates thunk → currencySlice + portfolioSlice via extraReducers (cross-slice)
 * - Preferred currency persists across sessions via redux-persist
 * - Layout delegated to CurrencyConverterLayout dumb component
 */
export function CurrencyConverter() {
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, UnknownAction>;

  // All values from memoized selectors — zero computation in this component
  const selectedCurrency = useAppSelector(selectSelectedCurrency);
  const loading = useAppSelector(selectCurrencyLoading);
  const error = useAppSelector(selectCurrencyError);
  const rates = useAppSelector(selectRates);
  const rateTable = useAppSelector(selectRateTable);
  const lastUpdated = useAppSelector(selectRatesLastUpdated);

  // Local UI state only — not derived data
  const [fromAmount, setFromAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState(selectedCurrency);

  // Conversion result computed entirely in selector
  const convertedAmount = useAppSelector((state) =>
    selectConvertedAmount(state, { fromAmount, fromCurrency, toCurrency })
  );

  const handleBaseCurrencyChange = async (currency: string) => {
    dispatch(setSelectedCurrency(currency));
    await dispatch(fetchRates(currency));
  };

  return (
    <CurrencyConverterLayout
      selectedCurrency={selectedCurrency}
      loading={loading}
      error={error}
      rates={rates}
      rateTable={rateTable}
      lastUpdated={lastUpdated}
      convertedAmount={convertedAmount}
      fromAmount={fromAmount}
      fromCurrency={fromCurrency}
      toCurrency={toCurrency}
      onFromAmountChange={setFromAmount}
      onFromCurrencyChange={setFromCurrency}
      onToCurrencyChange={setToCurrency}
      onBaseCurrencyChange={handleBaseCurrencyChange}
    />
  );
}
