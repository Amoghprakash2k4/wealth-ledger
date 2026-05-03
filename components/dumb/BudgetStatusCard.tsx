import { selectBudgetStatus } from '@/lib/store/selectors/transactionsSelectors';

interface BudgetStatusCardProps {
  budgetStatus: ReturnType<typeof selectBudgetStatus>;
}

/**
 * DUMB COMPONENT: Budget status display
 * All data and class names provided by selectors — zero business logic
 */
export function BudgetStatusCard({ budgetStatus }: BudgetStatusCardProps) {
  const {
    isOverBudget,
    isWarning,
    totalSpendingFormatted,
    budgetFormatted,
    clampedUtilization,
    utilizationFormatted,
    remainingFormatted,
    remaining,
    budgetColor,
  } = budgetStatus;

  return (
    <div className={`rounded-2xl p-5 ${budgetColor.bgClass} border ${budgetColor.borderClass}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white">Monthly Budget</h2>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${budgetColor.bgClass} ${budgetColor.textClass} border ${budgetColor.borderClass}`}>
          {isOverBudget ? '🚨 Over' : isWarning ? '⚠️ Warning' : '✅ On Track'}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-text-secondary">
            {totalSpendingFormatted} / {budgetFormatted}
          </span>
          <span className={`font-bold ${budgetColor.textClass}`}>
            {utilizationFormatted}
          </span>
        </div>
        <div className="w-full rounded-full h-3 bg-bg-elevated">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${budgetColor.barClass} ${budgetColor.shadowClass}`}
            style={{ width: `${clampedUtilization}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-text-muted">
        {remaining >= 0
          ? `${remainingFormatted} remaining this month`
          : `${remainingFormatted} over budget`}
      </p>
    </div>
  );
}
