'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { login } from '@/lib/store/slices/authSlice';
import { fetchTransactions } from '@/lib/store/slices/transactionsSlice';
import { fetchCryptoPrices } from '@/lib/store/slices/portfolioSlice';
import { fetchRates } from '@/lib/store/slices/currencySlice';
import { useRouter } from 'next/navigation';
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store/store';

const PARTICLE_COUNT = 18;
const PARTICLE_CLASSES = ['animate-float-0', 'animate-float-1', 'animate-float-2', 'animate-float-3', 'animate-float-4'];
const PARTICLE_COLORS = ['bg-accent-primary/50', 'bg-accent-secondary/40', 'bg-accent-tertiary/30'];

/**
 * SMART COMPONENT: Handles user authentication (FEATURE 01)
 * - Dispatches login thunk → triggers fetchTransactions + fetchCryptoPrices + fetchRates
 * - Each thunk is listened to by ≥2 slices (cross-slice patterns in extraReducers)
 */
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, UnknownAction>;
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // @ts-expect-error - RTK generic inference issue with async thunks in React components
      await dispatch(login({ email, password })).unwrap();
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-login">
      {/* Background glow orbs */}
      <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none bg-radial-indigo -top-[100px] -left-[150px]" />
      <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none bg-radial-violet -bottom-[80px] -right-[100px]" />

      {/* Floating particles */}
      {mounted && Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <div
          key={i}
          className={`absolute rounded-full pointer-events-none w-[${2 + (i % 3)}px] h-[${2 + (i % 3)}px] ${PARTICLE_COLORS[i % 3]} ${PARTICLE_CLASSES[i % PARTICLE_CLASSES.length]} left-[${(i * 37 + 13) % 90 + 5}%] top-[${(i * 53 + 7) % 80 + 10}%]`}
        />
      ))}

      {/* Card */}
      <div className={`relative z-10 w-full max-w-md mx-4 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Gradient ring wrapper */}
        <div className="p-[1px] rounded-2xl bg-gradient-ring animate-pulse-ring">
          <div className="rounded-2xl p-8 bg-gradient-card-login">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center mb-4">
                {/* Spinning ring */}
                <div className="absolute w-20 h-20 rounded-full bg-conic-spin animate-spin-slow p-[2px] mask-ring" />
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black bg-gradient-indigo shadow-[0_0_24px_rgba(99,102,241,0.5)]">
                  W
                </div>
              </div>
              <h1 className="text-2xl font-black tracking-tight gradient-text">WealthLedger</h1>
              <p className="text-sm mt-1 text-text-muted">
                Personal Finance Dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-current outline-none transition-all duration-200 input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200 input-field"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm error-banner">
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-base transition-all duration-200 relative overflow-hidden ${
                  loading
                    ? 'bg-bg-elevated text-text-muted cursor-not-allowed'
                    : 'bg-gradient-indigo text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center text-xs mt-6 text-text-muted">
              Demo · any email &amp; password works
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
