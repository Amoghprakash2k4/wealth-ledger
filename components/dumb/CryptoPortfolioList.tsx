import { selectPortfolioBreakdown, selectTotalProfitLoss } from '@/lib/store/selectors/portfolioSelectors';

const COIN_CONFIG: Record<string, { colorClass: string; shadowClass: string; emoji: string; bgClass: string }> = {
  BTC: { colorClass: 'text-[#f97316]', shadowClass: 'shadow-[0_0_16px_rgba(249,115,22,0.3)]', emoji: '₿', bgClass: 'bg-orange-glow' },
  ETH: { colorClass: 'text-accent-secondary', shadowClass: 'shadow-[0_0_16px_rgba(139,92,246,0.3)]', emoji: 'Ξ', bgClass: 'bg-violet-glow-12' },
  SOL: { colorClass: 'text-accent-green', shadowClass: 'shadow-[0_0_16px_rgba(16,185,129,0.3)]', emoji: '◎', bgClass: 'bg-green-bg-12' },
};

const DEFAULT_COIN = { colorClass: 'text-accent-primary', shadowClass: 'shadow-[0_0_16px_rgba(99,102,241,0.3)]', emoji: '🪙', bgClass: 'bg-indigo-glow' };

type BreakdownItem = ReturnType<typeof selectPortfolioBreakdown>[number];
type TotalPL = ReturnType<typeof selectTotalProfitLoss>;

interface CryptoPortfolioListProps {
  breakdown: BreakdownItem[];
  totalProfitLoss: TotalPL;
}

/**
 * DUMB COMPONENT: Renders portfolio asset cards
 * All data pre-formatted by selectors, no business logic here
 */
export function CryptoPortfolioList({ breakdown, totalProfitLoss }: CryptoPortfolioListProps) {
  const { plPositive, amountFormatted, percentageFormatted } = totalProfitLoss;

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Crypto Portfolio</h2>
        <div className={`text-right px-3 py-1.5 rounded-xl border ${plPositive ? 'bg-green-bg border-green-border-strong' : 'bg-red-bg border-red-border-strong'}`}>
          <p className="text-xs text-text-muted">Total P/L</p>
          <p className={`text-sm font-bold ${plPositive ? 'text-accent-green' : 'text-accent-red'}`}>
            {amountFormatted}
            <span className="text-xs ml-1 opacity-80">
              ({percentageFormatted})
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {breakdown.map((asset) => {
          const cfg = COIN_CONFIG[asset.symbol] ?? DEFAULT_COIN;

          return (
            <div
              key={asset.symbol}
              className={`rounded-xl p-4 transition-all duration-200 bg-bg-elevated border border-border-default hover:${cfg.shadowClass} hover:border-current`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${cfg.bgClass} ${cfg.colorClass}`}>
                    {cfg.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-white">{asset.symbol}</p>
                    <p className="text-xs text-text-muted">
                      {asset.amount} coins · {asset.currentPriceFormatted} each
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{asset.currentValueFormatted}</p>
                  <p className={`text-xs ${asset.isUp ? 'text-accent-green' : 'text-accent-red'}`}>
                    {asset.priceChange24hFormatted} 24h
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 flex justify-between items-center border-t border-border-default">
                <p className="text-xs text-text-muted">
                  Cost basis: {asset.purchaseValueFormatted}
                </p>
                <p className={`text-xs font-semibold ${asset.plUp ? 'text-accent-green' : 'text-accent-red'}`}>
                  {asset.profitLossFormatted} ({asset.profitLossPercentFormatted})
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
