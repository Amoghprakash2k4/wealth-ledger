import { Middleware, UnknownAction } from '@reduxjs/toolkit';

// Middleware to persist selected currency to localStorage
export const currencyPersistenceMiddleware: Middleware =
  (store) => (next) => (action: UnknownAction) => {
    const result = next(action);

    // After every action, check if currency changed
    if (action.type === 'currency/setSelectedCurrency') {
      const state = store.getState() as { currency: { selectedCurrency: string } };
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferredCurrency', state.currency.selectedCurrency);
      }
    }

    return result;
  };
