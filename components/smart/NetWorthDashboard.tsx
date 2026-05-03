'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import { selectNetWorth, selectAssetAllocation, selectDashboardLoading } from '@/lib/store/selectors/portfolioSelectors';
import { usePricePolling } from '@/lib/hooks/usePricePolling';
import { NetWorthCard } from '../dumb/NetWorthCard';
import { AssetBreakdownChart } from '../dumb/AssetBreakdownChart';
import { RecentAlerts } from './RecentAlerts';

/**
 * SMART COMPONENT: Net Worth Dashboard (FEATURE 05)
 * - Uses selectors only (no business logic)
 * - Implements 60-second polling via custom hook
 * - isLoading derived in selectDashboardLoading selector (no derived state here)
 * - Layout delegated to dumb components
 */
export function NetWorthDashboard() {
  // FEATURE 05: 60-second polling for price updates
  usePricePolling(60, true);

  // Read from selectors only - zero business logic
  const netWorth = useAppSelector(selectNetWorth);
  const assetAllocation = useAppSelector(selectAssetAllocation);
  const isLoading = useAppSelector(selectDashboardLoading);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Worth Summary */}
        <div className="lg:col-span-2">
          <NetWorthCard netWorth={netWorth} isLoading={isLoading} />
        </div>

        {/* Recent Alerts */}
        <div>
          <RecentAlerts />
        </div>
      </div>

      {/* Asset Breakdown */}
      <AssetBreakdownChart allocation={assetAllocation} isLoading={isLoading} />
    </div>
  );
}
