import { selectCategorySpendingList } from '@/lib/store/selectors/transactionsSelectors';

const CATEGORY_CONFIG: Record<string, { emoji: string; gradientClass: string }> = {
  food:          { emoji: '🍔', gradientClass: 'bg-gradient-bar-orange' },
  transport:     { emoji: '🚗', gradientClass: 'bg-gradient-bar-blue' },
  entertainment: { emoji: '🎮', gradientClass: 'bg-gradient-bar-violet' },
  utilities:     { emoji: '⚡', gradientClass: 'bg-gradient-bar-green' },
  shopping:      { emoji: '🛍️', gradientClass: 'bg-gradient-bar-pink' },
  other:         { emoji: '📦', gradientClass: 'bg-gradient-bar-slate' },
};

interface CategorySpendingCardProps {
  spendingList: ReturnType<typeof selectCategorySpendingList>;
}

/**
 * DUMB COMPONENT: Category spending breakdown
 * All data pre-formatted by selectors
 */
export function CategorySpendingCard({ spendingList }: CategorySpendingCardProps) {
  return (
    <div className="card p-5">
      <h2 className="text-base font-bold text-white mb-4">This Month</h2>
      {spendingList.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-2xl mb-1">🌱</p>
          <p className="text-xs text-text-muted">No expenses this month</p>
        </div>
      ) : (
        <div className="space-y-3">
          {spendingList.map(({ category, amountFormatted, widthPercent, percentageFormatted }) => {
            const cfg = CATEGORY_CONFIG[category] ?? { emoji: '📦', gradientClass: 'bg-gradient-bar-slate' };
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{cfg.emoji}</span>
                    <span className="text-sm capitalize font-medium text-text-secondary">{category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{amountFormatted}</span>
                    <span className="text-xs font-bold text-text-secondary">{percentageFormatted}</span>
                  </div>
                </div>
                <div className="w-full rounded-full h-2 bg-bg-elevated">
                  <div
                    className={`h-2 rounded-full ${cfg.gradientClass} transition-[width] duration-500`}
                    style={{ width: widthPercent }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
