import { createListenerMiddleware, addListener, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { addNotification } from '../slices/notificationsSlice';
import { fetchTransactions } from '../slices/transactionsSlice';
import { fetchCryptoPrices } from '../slices/portfolioSlice';
import { fetchRates } from '../slices/currencySlice';
import { login, logout } from '../slices/authSlice';

export const listenerMiddleware = createListenerMiddleware();

// FEATURE 01: On login.fulfilled → dispatch data-fetching thunks
// This is the RTK-idiomatic alternative to dispatching from extraReducers
// (reducers must be pure; side-effect orchestration belongs in listenerMiddleware)
listenerMiddleware.startListening({
  actionCreator: login.fulfilled,
  effect: async (action, listenerApi) => {
    const appDispatch = listenerApi.dispatch as ThunkDispatch<RootState, unknown, UnknownAction>;
    const userId = action.payload.id;

    // Fetch all initial dashboard data in parallel
    await Promise.all([
      appDispatch(fetchTransactions(userId)),
      appDispatch(fetchCryptoPrices()),
      appDispatch(fetchRates('USD')),
    ]);
  },
});

// FEATURE 06: Budget alert listener
// This listens to transaction updates and fires notifications when budget is exceeded
listenerMiddleware.startListening({
  actionCreator: fetchTransactions.fulfilled,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const transactions = state.transactions.items;
    
    // Calculate monthly spending by category
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyExpenses = transactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      return (
        txn.type === 'expense' &&
        txnDate.getMonth() === currentMonth &&
        txnDate.getFullYear() === currentYear
      );
    });
    
    const totalMonthlySpending = monthlyExpenses.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );
    
    // Budget threshold: $3000/month
    const BUDGET_THRESHOLD = 3000;
    const budgetUtilization = (totalMonthlySpending / BUDGET_THRESHOLD) * 100;
    
    if (budgetUtilization > 100) {
      listenerApi.dispatch(
        addNotification({
          type: 'error',
          message: `Budget exceeded! You've spent $${totalMonthlySpending.toFixed(2)} this month (${budgetUtilization.toFixed(1)}% of budget)`,
        })
      );
    } else if (budgetUtilization > 80) {
      listenerApi.dispatch(
        addNotification({
          type: 'warning',
          message: `Budget warning: ${budgetUtilization.toFixed(1)}% of monthly budget used`,
        })
      );
    }
  },
});

// PERSISTENCE: On logout → purge persisted storage
// Lazy import of persistor avoids circular dependency (store ↔ listenerMiddleware)
listenerMiddleware.startListening({
  actionCreator: logout.fulfilled,
  effect: async () => {
    const { persistor } = await import('../store');
    await persistor.purge();
  },
});

export type AppStartListening = typeof listenerMiddleware.startListening;
export const startAppListening = listenerMiddleware.startListening;
export { addListener };

