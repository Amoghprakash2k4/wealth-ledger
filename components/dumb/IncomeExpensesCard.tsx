import { selectIncomeVsExpenses } from '@/lib/store/selectors/transactionsSelectors';

interface IncomeExpensesCardProps {
  incomeVsExpenses: ReturnType<typeof selectIncomeVsExpenses>;
}

/**
 * DUMB COMPONENT: Income vs Expenses display
 * All data pre-formatted by selectors
 */
export function IncomeExpensesCard({ incomeVsExpenses }: IncomeExpensesCardProps) {
  const { incomeFormatted, expensesFormatted, netIncomeFormatted, isNetPositive } = incomeVsExpenses;

  const items = [
    { label: 'Income', value: incomeFormatted, colorClass: 'text-accent-green', bgClass: 'bg-green-glow', emoji: '📈' },
    { label: 'Expenses', value: expensesFormatted, colorClass: 'text-accent-red', bgClass: 'bg-red-glow', emoji: '📉' },
    { label: 'Net', value: netIncomeFormatted, colorClass: isNetPositive ? 'text-accent-green' : 'text-accent-red', bgClass: 'bg-indigo-glow', emoji: '💡' },
  ];

  return (
    <div className="card p-5">
      <h2 className="text-base font-bold text-white mb-3">Income vs Expenses</h2>
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ label, value, colorClass, bgClass, emoji }) => (
          <div key={label} className={`rounded-xl p-3 text-center ${bgClass}`}>
            <span className="text-lg">{emoji}</span>
            <p className="text-xs mt-1 mb-1 text-text-muted">{label}</p>
            <p className={`text-sm font-bold ${colorClass}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
