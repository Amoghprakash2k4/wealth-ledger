import type { NotificationDisplay } from '@/lib/store/selectors/notificationsSelectors';

interface AlertsListProps {
  notifications: NotificationDisplay[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
}

/**
 * DUMB COMPONENT: Renders the alerts/notifications list
 * All data pre-formatted by selectors — zero business logic
 */
export function AlertsList({ notifications, unreadCount, onMarkRead }: AlertsListProps) {
  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Alerts</h2>
        {unreadCount > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-accent-red">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <span className="text-3xl mb-2">🔕</span>
            <p className="text-sm text-text-muted">No alerts yet</p>
            <p className="text-xs mt-1 text-text-muted">crypto changes &gt;5% trigger alerts</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              className={`w-full text-left rounded-xl p-3 transition-all duration-200 border-t border-r border-b ${n.bgClass} ${n.borderClass} border-l-[3px] ${n.read ? 'opacity-60' : 'opacity-100'}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {n.message}
                  </p>
                  <p className="text-[10px] mt-1 text-text-muted">
                    {n.timeFormatted}
                  </p>
                </div>
                {!n.read && (
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${n.dotColorClass}`} />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
