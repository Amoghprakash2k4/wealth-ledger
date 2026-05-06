import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import { listenerMiddleware } from './middleware/listenerMiddleware';

import authReducer from './slices/authSlice';
import portfolioReducer from './slices/portfolioSlice';
import currencyReducer from './slices/currencySlice';
import transactionsReducer from './slices/transactionsSlice';
import notificationsReducer from './slices/notificationsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  portfolio: portfolioReducer,
  currency: currencyReducer,
  transactions: transactionsReducer,
  notifications: notificationsReducer,
});

const persistConfig = {
  key: 'wealthledger',
  version: 1,
  storage,
  // Persist auth (login session), currency (selected currency + rates),
  // portfolio (holdings + prices), and transactions.
  // Notifications are ephemeral — not persisted.
  whitelist: ['auth', 'currency', 'portfolio', 'transactions'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches non-serializable actions internally;
        // ignore them so RTK's serializable check doesn't warn.
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).prepend(listenerMiddleware.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
