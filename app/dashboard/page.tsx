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
import { NotificationDropdown } from '@/components/smart/NotificationDropdown';
import { ToastProvider } from '@/components/smart/ToastProvider';

import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store/store';

type Tab = 'overview' | 'portfolio' | 'spending' | 'tools';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, UnknownAction>;
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

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
      <ToastProvider />
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
            <NotificationDropdown />

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

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-[color:var(--border)] pb-px overflow-x-auto hide-scrollbar">
          {(
            [
              { id: 'overview', label: 'Net Worth', icon: '💰' },
              { id: 'portfolio', label: 'Crypto Portfolio', icon: '📈' },
              { id: 'spending', label: 'Expenditure', icon: '💸' },
              { id: 'tools', label: 'Currency Converter', icon: '🛠️' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-[color:var(--text-muted)] hover:text-white hover:border-[color:var(--border)]'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <NetWorthDashboard />
              </section>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <CryptoPortfolio />
              </section>
            </div>
          )}

          {activeTab === 'spending' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <SpendingInsights />
              </section>
              <section>
                <TransactionsList />
              </section>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <CurrencyConverter />
              </section>
            </div>
          )}
        </div>
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
