'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { markAsRead } from '@/lib/store/slices/notificationsSlice';
import { selectRecentNotifications, selectUnreadCount } from '@/lib/store/selectors/notificationsSelectors';
import { AlertsList } from '../dumb/AlertsList';

/**
 * SMART COMPONENT: Displays recent notifications (reads Redux)
 * - All derived state in selectors (formatting, slicing, type config)
 * - Layout delegated to AlertsList dumb component
 */
export function RecentAlerts() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => selectRecentNotifications(state, 6));
  const unreadCount = useAppSelector(selectUnreadCount);

  return (
    <AlertsList
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkRead={(id) => dispatch(markAsRead(id))}
    />
  );
}
