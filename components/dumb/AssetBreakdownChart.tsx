/**
 * DUMB COMPONENT: Displays asset allocation breakdown
 * Pure presentation, no Redux access — all data via props, pre-formatted by selectors
 */

import { selectAssetAllocation } from '@/lib/store/selectors/portfolioSelectors';

const ASSET_CONFIG: Record<string, { gradientClass: string; shadowClass: string; emoji: string }> = {
  BTC: { gradientClass: 'bg-gradient-bar-orange', shadowClass: 'shadow-[0_0_8px_rgba(249,115,22,0.3)]', emoji: '₿' },
  ETH: { gradientClass: 'bg-gradient-bar-violet', shadowClass: 'shadow-[0_0_8px_rgba(139,92,246,0.3)]', emoji: 'Ξ' },
  SOL: { gradientClass: 'bg-gradient-bar-green', shadowClass: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]', emoji: '◎' },
  cash: { gradientClass: 'bg-gradient-bar-blue', shadowClass: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]', emoji: '$' },
};

interface AssetBreakdownChartProps {
  allocation: ReturnType<typeof selectAssetAllocation>;
  isLoading: boolean;
}

export function AssetBreakdownChart({ allocation, isLoading }: AssetBreakdownChartProps) {
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="skeleton h-5 w-32 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-3 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const allAssets = [
    ...allocation.crypto.map((a) => ({ key: a.symbol, label: a.symbol, percentage: a.percentage, valueFormatted: a.valueFormatted, percentageFormatted: a.percentageFormatted })),
    { key: 'cash', label: 'Cash', percentage: allocation.cash.percentage, valueFormatted: allocation.cash.valueFormatted, percentageFormatted: allocation.cash.percentageFormatted },
  ];

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-white mb-6">Asset Allocation</h2>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-6 gap-0.5 bg-bg-elevated">
        {allAssets.map((a) => {
          const cfg = ASSET_CONFIG[a.key] ?? ASSET_CONFIG.cash;
          return (
            <div
              key={a.key}
              className={`${cfg.gradientClass} transition-[width] duration-700`}
              style={{ width: `${Math.max(a.percentage, 0.5)}%` }}
            />
          );
        })}
      </div>

      <div className="space-y-3">
        {allAssets.map((a) => {
          const cfg = ASSET_CONFIG[a.key] ?? ASSET_CONFIG.cash;
          return (
            <div key={a.key}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white ${cfg.gradientClass}`}>
                    {cfg.emoji}
                  </span>
                  <span className="font-medium text-sm text-text-primary">{a.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">{a.valueFormatted}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-bg-elevated text-text-secondary">
                    {a.percentageFormatted}
                  </span>
                </div>
              </div>
              <div className="w-full rounded-full h-2 bg-bg-elevated">
                <div
                  className={`h-2 rounded-full ${cfg.gradientClass} ${cfg.shadowClass} transition-[width] duration-700`}
                  style={{ width: `${Math.min(a.percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
