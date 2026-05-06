'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import {
  selectPortfolioBreakdown,
  selectTotalProfitLoss,
  selectAssetAllocation,
} from '@/lib/store/selectors/portfolioSelectors';
import { CryptoPortfolioList } from '../dumb/CryptoPortfolioList';
import { AssetBreakdownChart } from '../dumb/AssetBreakdownChart';
import { CryptoCharts } from '../dumb/CryptoCharts';

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
  const assetAllocation = useAppSelector(selectAssetAllocation);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 h-[280px] skeleton" />
          <div className="card p-6 h-[280px] skeleton" />
        </div>
        <div className="card p-6">
          <div className="skeleton h-5 w-32 mb-6" />
          <div className="space-y-4">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-3 w-full rounded-full" />
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <div className="skeleton h-6 w-36 mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CryptoCharts breakdown={breakdown} />
      <AssetBreakdownChart allocation={assetAllocation} isLoading={loading} />
      <CryptoPortfolioList breakdown={breakdown} totalProfitLoss={totalProfitLoss} />
    </div>
  );
}
