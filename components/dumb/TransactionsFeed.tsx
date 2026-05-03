import type { Transaction } from '@/lib/store/slices/transactionsSlice';

const CATEGORY_CONFIG: Record<string, { emoji: string; colorClass: string; bgClass: string }> = {
  food:          { emoji: '🍔', colorClass: 'text-[#f97316]', bgClass: 'bg-orange-glow' },
  transport:     { emoji: '🚗', colorClass: 'text-accent-blue', bgClass: 'bg-blue-glow' },
  entertainment: { emoji: '🎮', colorClass: 'text-accent-secondary', bgClass: 'bg-violet-glow-12' },
  utilities:     { emoji: '⚡', colorClass: 'text-accent-green', bgClass: 'bg-green-bg-12' },
  shopping:      { emoji: '🛍️', colorClass: 'text-accent-pink', bgClass: 'bg-pink-glow' },
  income:        { emoji: '💰', colorClass: 'text-accent-green', bgClass: 'bg-green-bg-12' },
  other:         { emoji: '📦', colorClass: 'text-text-secondary', bgClass: 'bg-slate-bg' },
};

const DEFAULT_CAT = { emoji: '📋', colorClass: 'text-accent-primary', bgClass: 'bg-indigo-glow' };

interface TransactionsFeedProps {
  transactions: (Transaction & { amountFormatted?: string })[];
  loading: boolean;
}

/**
 * DUMB COMPONENT: Renders the transaction list
 * All data pre-formatted by selectors
 */
export function TransactionsFeed({ transactions, loading }: TransactionsFeedProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-sm text-text-muted">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {transactions.map((txn) => {
        const cfg = CATEGORY_CONFIG[txn.category] ?? DEFAULT_CAT;
        const isIncome = txn.type === 'income';
        return (
          <div
            key={txn.id}
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors bg-bg-elevated border border-border-default hover:border-border-bright"
          >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${cfg.bgClass}`}>
              {cfg.emoji}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white truncate">{txn.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize ${cfg.bgClass} ${cfg.colorClass}`}>
                  {txn.category}
                </span>
                <span className="text-xs text-text-muted">{txn.date}</span>
              </div>
            </div>

            {/* Amount */}
            <p className={`font-bold text-sm flex-shrink-0 ${isIncome ? 'text-accent-green' : 'text-text-primary'}`}>
              {isIncome ? '+' : '−'}{txn.amountFormatted}
            </p>
          </div>
        );
      })}
    </div>
  );
}
