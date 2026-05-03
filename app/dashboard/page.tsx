'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { logout } from '@/lib/store/slices/authSlice';
import { markAllAsRead } from '@/lib/store/slices/notificationsSlice';
import { NetWorthDashboard } from '@/components/smart/NetWorthDashboard';
import { CryptoPortfolio } from '@/components/smart/CryptoPortfolio';
import { TransactionsList } from '@/components/smart/TransactionsList';
import { SpendingInsights } from '@/components/smart/SpendingInsights';
import { CurrencyConverter } from '@/components/smart/CurrencyConverter';
import { RecentAlerts } from '@/components/smart/RecentAlerts';

import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store/store';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, UnknownAction>;
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  const [showNotifBadge, setShowNotifBadge] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setShowNotifBadge(unreadCount > 0);
  }, [unreadCount]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{ border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  const initials = (user?.name ?? 'U').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Top navigation bar */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'rgba(13,15,20,0.85)', backdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              W
            </div>
            <span className="font-bold text-lg tracking-tight gradient-text">WealthLedger</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications bell */}
            <button
              onClick={() => { dispatch(markAllAsRead()); setShowNotifBadge(false); }}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              title="Mark all as read"
            >
              <span className="text-base">🔔</span>
              {showNotifBadge && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: '#ef4444' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {initials}
              </div>
              <span className="text-sm hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                {user?.name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            Good {getGreeting()}, <span className="gradient-text">{user?.name}</span> 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Here's your financial overview — updated live
          </p>
        </div>

        {/* FEATURE 05: Net Worth Dashboard */}
        <section>
          <NetWorthDashboard />
        </section>

        {/* Two-column: Crypto + Spending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FEATURE 03: Crypto Portfolio */}
          <section>
            <CryptoPortfolio />
          </section>

          {/* FEATURE 06: Spending Insights */}
          <section>
            <SpendingInsights />
          </section>
        </div>

        {/* FEATURE 04: Currency Converter */}
        <section>
          <CurrencyConverter />
        </section>

        {/* FEATURE 02: Transaction Feed */}
        <section>
          <TransactionsList />
        </section>
      </main>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
