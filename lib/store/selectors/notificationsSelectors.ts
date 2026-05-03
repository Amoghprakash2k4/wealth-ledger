import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Notification } from '../slices/notificationsSlice';

const selectNotificationsState = (state: RootState) => state.notifications;

const TYPE_CONFIG: Record<Notification['type'], { borderClass: string; bgClass: string; icon: string; label: string }> = {
  success: { borderClass: 'border-accent-green', bgClass: 'notif-success', icon: '📈', label: 'Gain' },
  warning: { borderClass: 'border-accent-amber', bgClass: 'notif-warning', icon: '⚠️', label: 'Alert' },
  error:   { borderClass: 'border-accent-red', bgClass: 'notif-error', icon: '🚨', label: 'Risk' },
  info:    { borderClass: 'border-accent-primary', bgClass: 'notif-info', icon: 'ℹ️', label: 'Info' },
};

export interface NotificationDisplay {
  id: string;
  type: Notification['type'];
  message: string;
  timeFormatted: string;
  read: boolean;
  icon: string;
  label: string;
  bgClass: string;
  borderClass: string;
  dotColorClass: string;
}

/** Top-N recent notifications, display-ready */
export const selectRecentNotifications = createSelector(
  [selectNotificationsState, (_state: RootState, count: number) => count],
  (notificationsState, count): NotificationDisplay[] => {
    return notificationsState.items.slice(0, count).map((n) => {
      const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
      return {
        id: n.id,
        type: n.type,
        message: n.message,
        timeFormatted: new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: n.read,
        icon: cfg.icon,
        label: cfg.label,
        bgClass: n.read ? 'notif-read' : cfg.bgClass,
        borderClass: n.read ? 'border-border-default' : cfg.borderClass,
        dotColorClass: cfg.borderClass.replace('border-', 'bg-'),
      };
    });
  }
);

export const selectUnreadCount = createSelector(
  [selectNotificationsState],
  (state) => state.unreadCount
);
