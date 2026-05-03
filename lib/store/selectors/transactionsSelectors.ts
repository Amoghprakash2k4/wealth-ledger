import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Transaction } from '../slices/transactionsSlice';

const fmt = (v: number, decimals: number = 2) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);

// Base selectors
const selectTransactionsState = (state: RootState) => state.transactions;
export const selectAllTransactions = (state: RootState) => state.transactions.items;

// Selector: Filter transactions by category
export const selectTransactionsByCategory = createSelector(
  [selectAllTransactions, (_state: RootState, category: string) => category],
  (transactions, category) => {
    if (!category || category === 'all') return transactions;
    return transactions.filter((txn: Transaction) => txn.category === category);
  }
);

// Selector: Filtered list fallback (eliminates component derived state)
export const selectFilteredTransactions = createSelector(
  [selectAllTransactions, selectTransactionsByCategory, (_state: RootState, category: string) => category],
  (allTransactions, filteredTransactions, category) => {
    const list = category !== 'all' ? filteredTransactions : allTransactions;
    return list.map(txn => ({
      ...txn,
      amountFormatted: fmt(txn.amount),
    }));
  }
);

// Selector: Filter transactions by date range
export const selectTransactionsByDateRange = createSelector(
  [
    selectAllTransactions,
    (_state: RootState, startDate: string) => startDate,
    (_state: RootState, _startDate: string, endDate: string) => endDate,
  ],
  (transactions, startDate, endDate) => {
    return transactions.filter((txn: Transaction) => {
      const txnDate = new Date(txn.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return txnDate >= start && txnDate <= end;
    });
  }
);

// Selector: Filter transactions by minimum amount
export const selectTransactionsByMinAmount = createSelector(
  [selectAllTransactions, (_state: RootState, minAmount: number) => minAmount],
  (transactions, minAmount) => {
    return transactions.filter((txn: Transaction) => txn.amount >= minAmount);
  }
);

// Selector: Monthly spending by category (FEATURE 06)
export const selectMonthlySpendingByCategory = createSelector(
  [selectAllTransactions],
  (transactions) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses = transactions.filter((txn: Transaction) => {
      const txnDate = new Date(txn.date);
      return (
        txn.type === 'expense' &&
        txnDate.getMonth() === currentMonth &&
        txnDate.getFullYear() === currentYear
      );
    });

    const byCategory: Record<string, number> = {};

    monthlyExpenses.forEach((txn: Transaction) => {
      byCategory[txn.category] = (byCategory[txn.category] || 0) + txn.amount;
    });

    return byCategory;
  }
);

export interface CategorySpendingDisplay {
  category: string;
  amount: number;
  amountFormatted: string;
  percentage: number;
  percentageFormatted: string;
  widthPercent: string;
}

// Selector: Sorted spending display list with pre-calculated percentages (FEATURE 06)
export const selectCategorySpendingList = createSelector(
  [selectMonthlySpendingByCategory, (state) => selectTotalMonthlySpending(state)],
  (spendingByCategory, totalSpending): CategorySpendingDisplay[] => {
    return Object.entries(spendingByCategory)
      .map(([category, amount]) => {
        const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
        return {
          category,
          amount,
          amountFormatted: fmt(amount),
          percentage,
          percentageFormatted: `${percentage.toFixed(0)}%`,
          widthPercent: `${percentage.toFixed(0)}%`,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }
);

// Selector: Total monthly spending
export const selectTotalMonthlySpending = createSelector(
  [selectMonthlySpendingByCategory],
  (spendingByCategory) => {
    return Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);
  }
);

// Selector: Budget utilization percentage
export const selectBudgetUtilization = createSelector(
  [selectTotalMonthlySpending],
  (totalSpending) => {
    const BUDGET_THRESHOLD = 3000;
    return (totalSpending / BUDGET_THRESHOLD) * 100;
  }
);

// Selector: Budget status (FEATURE 06)
export const selectBudgetStatus = createSelector(
  [selectBudgetUtilization, selectTotalMonthlySpending],
  (utilization, totalSpending) => {
    const BUDGET_THRESHOLD = 3000;
    const remaining = BUDGET_THRESHOLD - totalSpending;
    const isOverBudget = utilization > 100;
    const isWarning = utilization > 80 && utilization <= 100;

    let budgetColor = {
      barClass: 'bg-gradient-bar-green',
      textClass: 'text-accent-green',
      bgClass: 'bg-green-glow',
      borderClass: 'border-green-border',
      shadowClass: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    };
    if (isOverBudget) {
      budgetColor = {
        barClass: 'bg-gradient-bar-red',
        textClass: 'text-accent-red',
        bgClass: 'bg-red-glow',
        borderClass: 'border-red-border',
        shadowClass: 'shadow-[0_0_10px_rgba(239,68,68,0.2)]',
      };
    } else if (isWarning) {
      budgetColor = {
        barClass: 'bg-gradient-bar-amber',
        textClass: 'text-accent-amber',
        bgClass: 'bg-amber-glow',
        borderClass: 'border-amber-border',
        shadowClass: 'shadow-[0_0_10px_rgba(245,158,11,0.2)]',
      };
    }

    const clampedUtilization = Math.min(utilization, 100);

    return {
      utilization,
      utilizationFormatted: `${utilization.toFixed(0)}%`,
      clampedUtilization,
      totalSpending,
      totalSpendingFormatted: fmt(totalSpending),
      budget: BUDGET_THRESHOLD,
      budgetFormatted: fmt(BUDGET_THRESHOLD, 0),
      remaining,
      remainingFormatted: remaining >= 0 ? fmt(remaining, 0) : fmt(Math.abs(remaining), 0),
      isOverBudget,
      isWarning,
      budgetColor,
    };
  }
);

// Selector: Recent transactions (last 10)
export const selectRecentTransactions = createSelector(
  [selectAllTransactions],
  (transactions) => {
    return transactions.slice(0, 10);
  }
);

// Selector: Income vs Expenses summary
export const selectIncomeVsExpenses = createSelector(
  [selectAllTransactions],
  (transactions) => {
    const income = transactions
      .filter((txn: Transaction) => txn.type === 'income')
      .reduce((sum: number, txn: Transaction) => sum + txn.amount, 0);

    const expenses = transactions
      .filter((txn: Transaction) => txn.type === 'expense')
      .reduce((sum: number, txn: Transaction) => sum + txn.amount, 0);

    const netIncome = income - expenses;

    return {
      income,
      incomeFormatted: fmt(income, 0),
      expenses,
      expensesFormatted: fmt(expenses, 0),
      netIncome,
      netIncomeFormatted: fmt(netIncome, 0),
      isNetPositive: netIncome >= 0,
    };
  }
);

export const selectTransactionsLoading = createSelector(
  [selectTransactionsState],
  (state) => state.loading
);

export const selectTransactionsError = createSelector(
  [selectTransactionsState],
  (state) => state.error
);
