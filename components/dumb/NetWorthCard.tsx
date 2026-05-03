/**
 * DUMB COMPONENT: Displays net worth data
 * Receives all data via props, no Redux access
 */

import { selectNetWorth } from '@/lib/store/selectors/portfolioSelectors';

interface NetWorthCardProps {
  netWorth: ReturnType<typeof selectNetWorth>;
  isLoading: boolean;
}

export function NetWorthCard({ netWorth, isLoading }: NetWorthCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 relative overflow-hidden bg-gradient-networth border border-border-default">
        <div className="skeleton h-5 w-28 mb-4" />
        <div className="skeleton h-12 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-default">
          <div className="skeleton h-14 rounded-xl" />
          <div className="skeleton h-14 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden bg-gradient-networth border border-indigo-border-strong shadow-[0_0_40px_rgba(99,102,241,0.12)]">
      {/* Decorative orb */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none bg-radial-violet-18 translate-x-[30%] -translate-y-[30%]" />

      <p className="text-sm font-medium relative text-violet-text">Total Net Worth</p>
      <div className="relative mt-2 mb-6">
        <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          {netWorth.totalFormatted}
        </span>
        <span className="ml-2 text-sm font-semibold px-2 py-0.5 rounded-full bg-indigo-bg text-accent-tertiary">
          {netWorth.currency}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 relative border-t border-white-8">
        <div className="rounded-xl p-3 bg-white-5">
          <p className="text-xs mb-1 text-slate-muted">Crypto Portfolio</p>
          <p className="text-lg font-bold text-white">{netWorth.portfolioFormatted}</p>
        </div>
        <div className="rounded-xl p-3 bg-white-5">
          <p className="text-xs mb-1 text-slate-muted">Cash Balance</p>
          <p className="text-lg font-bold text-white">{netWorth.cashFormatted}</p>
        </div>
      </div>
    </div>
  );
}
