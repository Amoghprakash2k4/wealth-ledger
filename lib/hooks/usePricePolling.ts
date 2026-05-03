import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { fetchCryptoPrices } from '@/lib/store/slices/portfolioSlice';
import { fetchRates } from '@/lib/store/slices/currencySlice';
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store/store';

/**
 * Custom hook for polling crypto prices and exchange rates
 * FEATURE 05: Polling setup lives in a hook, not in component or slice
 * 
 * @param intervalSeconds - Polling interval in seconds (default: 60)
 * @param enabled - Whether polling is enabled (default: true)
 */
export function usePricePolling(intervalSeconds: number = 60, enabled: boolean = true) {
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, UnknownAction>;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Clear interval if polling is disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    dispatch(fetchCryptoPrices());
    dispatch(fetchRates('USD'));

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      dispatch(fetchCryptoPrices());
      dispatch(fetchRates('USD'));
    }, intervalSeconds * 1000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dispatch, intervalSeconds, enabled]);
}
