// Re-export all selectors for easy importing
export * from './transactionsSelectors';
export * from './portfolioSelectors';
export * from './notificationsSelectors';
export * from './currencySelectors';

// Base selector for all transactions
import type { RootState } from '../store';

export const selectAllTransactions = (state: RootState) => state.transactions.items;
