'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { selectRecentNotifications } from '@/lib/store/selectors/notificationsSelectors';
import { markAsRead } from '@/lib/store/slices/notificationsSlice';

interface Toast {
  id: string;
  message: string;
  icon: string;
  bgClass: string;
  borderClass: string;
}

export function ToastProvider() {
  const dispatch = useAppDispatch();
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // We use the selector to get formatted notifications
  const recentNotifs = useAppSelector((state) => selectRecentNotifications(state, 5));
  const prevNotifsRef = useRef(recentNotifs);

  useEffect(() => {
    const prev = prevNotifsRef.current;
    
    // Find new notifications that weren't in the previous state and are unread
    const newNotifs = recentNotifs.filter(
      (n) => !n.read && !prev.find((p) => p.id === n.id)
    );

    if (newNotifs.length > 0) {
      // Add new toasts
      const newToasts = newNotifs.map((n) => ({
        id: n.id,
        message: n.message,
        icon: n.icon,
        bgClass: n.bgClass,
        borderClass: n.borderClass,
      }));
      
      setToasts((current) => [...current, ...newToasts]);
      
      // Auto-dismiss toasts after 5 seconds
      newToasts.forEach((toast) => {
        setTimeout(() => {
          setToasts((current) => current.filter((t) => t.id !== toast.id));
        }, 5000);
      });
    }

    prevNotifsRef.current = recentNotifs;
  }, [recentNotifs]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border-l-[4px] shadow-2xl animate-in fade-in slide-in-from-right-8 duration-300 ${toast.bgClass} ${toast.borderClass}`}
          style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-xl flex-shrink-0 mt-0.5">{toast.icon}</span>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-sm font-medium text-white leading-snug">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => {
              setToasts((c) => c.filter((t) => t.id !== toast.id));
              dispatch(markAsRead(toast.id));
            }}
            className="flex-shrink-0 text-text-muted hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
