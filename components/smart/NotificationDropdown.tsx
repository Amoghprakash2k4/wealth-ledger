'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { markAsRead, markAllAsRead, addNotification } from '@/lib/store/slices/notificationsSlice';
import { selectRecentNotifications, selectUnreadCount } from '@/lib/store/selectors/notificationsSelectors';
import { AlertsList } from '../dumb/AlertsList';

export function NotificationDropdown() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = useAppSelector((state) => selectRecentNotifications(state, 10));
  const unreadCount = useAppSelector(selectUnreadCount);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-bg-elevated hover:border-border-bright"
        style={{ background: isOpen ? 'var(--bg-elevated)' : 'var(--bg-surface)', border: `1px solid ${isOpen ? 'var(--accent-primary)' : 'var(--border)'}` }}
        title="Notifications"
      >
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
            style={{ background: '#ef4444' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header Actions */}
          <div className="px-4 py-2 border-b border-border-default flex justify-between items-center bg-bg-elevated">
            <button 
              onClick={() => {
                const types = ['info', 'warning', 'success', 'error'] as const;
                const randomType = types[Math.floor(Math.random() * types.length)];
                const messages = [
                  'Your BTC just went up 10%!',
                  'Warning: Rent budget is at 95%',
                  'Deposit of $500 received.',
                  'Failed to sync with exchange.'
                ];
                const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                
                dispatch(addNotification({
                  type: randomType,
                  message: randomMsg
                }));
              }}
              className="text-xs font-bold text-accent-primary hover:text-white transition-colors px-2 py-1 bg-accent-primary/10 rounded-md"
            >
              + Test Alert
            </button>
            <button 
              onClick={() => {
                dispatch(markAllAsRead());
              }}
              className="text-xs text-text-muted hover:text-white transition-colors"
            >
              Mark all as read
            </button>
          </div>
          
          {/* Alerts List Container */}
          <div className="flex-1 overflow-y-auto hide-scrollbar bg-bg-base">
            <AlertsList
              notifications={notifications}
              unreadCount={0} // Hide duplicate count inside the dropdown header
              onMarkRead={(id) => dispatch(markAsRead(id))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
