'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import {
  selectBudgetStatus,
  selectIncomeVsExpenses,
  selectCategorySpendingList,
} from '@/lib/store/selectors/transactionsSelectors';
import { BudgetStatusCard } from '../dumb/BudgetStatusCard';
import { IncomeExpensesCard } from '../dumb/IncomeExpensesCard';
import { CategorySpendingCard } from '../dumb/CategorySpendingCard';

import { SpendingCharts } from '../dumb/SpendingCharts';

/**
 * SMART COMPONENT: Spending Insights + Budget Alerts (FEATURE 06)
 * - All calculations in memoized selectors (No derived state inside component)
 * - listenerMiddleware fires addNotification when budget is exceeded (cross-slice)
 * - Layout is delegated to dumb components
 */
export function SpendingInsights() {
  const budgetStatus = useAppSelector(selectBudgetStatus);
  const incomeVsExpenses = useAppSelector(selectIncomeVsExpenses);
  const spendingList = useAppSelector(selectCategorySpendingList);

  return (
    <div className="space-y-6">
      <BudgetStatusCard budgetStatus={budgetStatus} />
      <SpendingCharts spendingList={spendingList} incomeVsExpenses={incomeVsExpenses} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IncomeExpensesCard incomeVsExpenses={incomeVsExpenses} />
        <CategorySpendingCard spendingList={spendingList} />
      </div>
    </div>
  );
}
