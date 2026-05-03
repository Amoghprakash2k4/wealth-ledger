import { configureStore } from '@reduxjs/toolkit';
import { listenerMiddleware } from './middleware/listenerMiddleware';
import { currencyPersistenceMiddleware } from './middleware/currencyPersistence';

import authReducer from './slices/authSlice';
import portfolioReducer from './slices/portfolioSlice';
import currencyReducer from './slices/currencySlice';
import transactionsReducer from './slices/transactionsSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    portfolio: portfolioReducer,
    currency: currencyReducer,
    transactions: transactionsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(currencyPersistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
