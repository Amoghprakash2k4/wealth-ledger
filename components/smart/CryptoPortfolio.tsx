'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import {
  selectPortfolioBreakdown,
  selectTotalProfitLoss,
} from '@/lib/store/selectors/portfolioSelectors';
import { CryptoPortfolioList } from '../dumb/CryptoPortfolioList';

/**
 * SMART COMPONENT: Crypto Portfolio Tracker (FEATURE 03)
 * - All data from memoized selectors (no business logic in component)
 * - notificationsSlice listens to fetchCryptoPrices.fulfilled (cross-slice)
 * - portfolioSlice listens to fetchRates.fulfilled (cross-slice)
 * - Layout is delegated to dumb component
 */
export function CryptoPortfolio() {
  const breakdown = useAppSelector(selectPortfolioBreakdown);
  const totalProfitLoss = useAppSelector(selectTotalProfitLoss);
  const loading = useAppSelector((state) => state.portfolio.loading);

  if (loading) {
    return (
      <div className="card p-6 space-y-4">
        <div className="skeleton h-6 w-36 mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return <CryptoPortfolioList breakdown={breakdown} totalProfitLoss={totalProfitLoss} />;
}
