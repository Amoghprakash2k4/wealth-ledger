import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchCryptoPrices } from './portfolioSlice';
import { login, logout } from './authSlice';
import { fetchTransactions } from './transactionsSlice';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

let notificationIdCounter = 0;

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: `notif_${notificationIdCounter++}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.items.unshift(notification);
      state.unreadCount += 1;
      
      // Keep only last 50 notifications
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notificationIndex = state.items.findIndex((n) => n.id === action.payload);
      if (notificationIndex !== -1 && !state.items[notificationIndex].read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        // Remove the notification from the list entirely
        state.items.splice(notificationIndex, 1);
      }
    },
    markAllAsRead: (state) => {
      state.unreadCount = 0;
      // Clear all notifications since they are all marked as read
      state.items = [];
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // CROSS-SLICE PATTERN #3: Listen to crypto price updates
      .addCase(fetchCryptoPrices.fulfilled, (state, action) => {
        const prices = action.payload;
        
        // Check for significant price movements (>5%)
        Object.entries(prices).forEach(([symbol, data]) => {
          const priceChange = Math.abs(data.price_change_percentage_24h);
          
          if (priceChange > 5) {
            const direction = data.price_change_percentage_24h > 0 ? 'up' : 'down';
            const notification: Notification = {
              id: `notif_${notificationIdCounter++}`,
              type: direction === 'up' ? 'success' : 'warning',
              message: `${symbol} is ${direction} ${priceChange.toFixed(2)}% in the last 24h`,
              timestamp: new Date().toISOString(),
              read: false,
            };
            
            state.items.unshift(notification);
            state.unreadCount += 1;
          }
        });
        
        // Keep only last 50 notifications
        if (state.items.length > 50) {
          state.items = state.items.slice(0, 50);
        }
      })
      // CROSS-SLICE: Listen to login
      .addCase(login.fulfilled, (state, action) => {
        state.items.unshift({
          id: `notif_${notificationIdCounter++}`,
          type: 'success',
          message: `Welcome back, ${action.payload.name}!`,
          timestamp: new Date().toISOString(),
          read: false,
        });
        state.unreadCount += 1;
      })
      // CROSS-SLICE: Listen to logout
      .addCase(logout.fulfilled, (state) => {
        state.items = [];
        state.unreadCount = 0;
      })
      // CROSS-SLICE: Listen to fetchTransactions
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.items.unshift({
          id: `notif_${notificationIdCounter++}`,
          type: 'info',
          message: `Successfully loaded ${action.payload.length} transactions.`,
          timestamp: new Date().toISOString(),
          read: false,
        });
        state.unreadCount += 1;
      });
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
