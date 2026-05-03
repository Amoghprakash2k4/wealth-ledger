# WealthLedger - Personal Finance Dashboard

A comprehensive Next.js + Redux Toolkit fintech application demonstrating advanced state management patterns, cross-slice side effects, and proper selector architecture.

## 🎯 Project Overview

This project implements all 6 required features with proper Redux Toolkit architecture:

1. ✅ **Auth + Onboarding** - Mock login with thunk chaining
2. ✅ **Transaction Feed + Filtering** - Selector-based filtering with memoization
3. ✅ **Crypto Portfolio Tracker** - Cross-slice reactions to price updates
4. ✅ **Multi-Currency Converter** - Currency persistence via middleware
5. ✅ **Net Worth Dashboard + Polling** - Custom hook for 60s price polling
6. ✅ **Spending Insights + Budget Alerts** - Listener middleware for alerts

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         VIEW LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Smart Comps  │  │ Dumb Comps   │  │ Custom Hooks │          │
│  │ (dispatch &  │→ │ (props only) │  │ (polling)    │          │
│  │  selectors)  │  │ zero state   │  │              │          │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘          │
│         │                                     │                  │
└─────────┼─────────────────────────────────────┼──────────────────┘
          │                                     │
          ▼                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SELECTOR LAYER                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  createSelector (Memoized, Composable)                     │ │
│  │  • selectNetWorth ← selectPortfolioValue ← selectPricesUSD│ │
│  │  • selectBudgetStatus ← selectBudgetUtil ← selectSpending │ │
│  │  • selectPortfolioBreakdown (formatted strings)           │ │
│  │  • selectAssetAllocation (formatted strings)              │ │
│  │  • selectRecentNotifications (display-ready + TW classes) │ │
│  │  • selectConvertedAmount (currency conversion)            │ │
│  │  • selectDashboardLoading (composed boolean)              │ │
│  │  • selectFilteredTransactions (category filtering)        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         REDUX STORE                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  auth    │  │portfolio │  │ currency │  │transactions│      │
│  │  Slice   │  │  Slice   │  │  Slice   │  │   Slice    │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘      │
│       │             │              │              │              │
│  ┌────▼─────────────▼──────────────▼──────────────▼──────┐      │
│  │           CROSS-SLICE PATTERNS (5+)                    │      │
│  │  ┌──────────────────────────────────────────────┐     │      │
│  │  │ extraReducers:                                │     │      │
│  │  │  • login        → auth + transactions +      │     │      │
│  │  │                   notifications (3 slices)   │     │      │
│  │  │  • logout       → auth + transactions +      │     │      │
│  │  │                   portfolio + currency +      │     │      │
│  │  │                   notifications (5 slices)   │     │      │
│  │  │  • fetchTxn     → transactions + notify      │     │      │
│  │  │  • fetchPrices  → portfolio + notify         │     │      │
│  │  │  • fetchRates   → currency + portfolio       │     │      │
│  │  └──────────────────────────────────────────────┘     │      │
│  │                                                        │      │
│  │  ┌──────────────────────────────────────────────┐     │      │
│  │  │ listenerMiddleware:                          │     │      │
│  │  │  • fetchTransactions → budget alerts        │     │      │
│  │  └──────────────────────────────────────────────┘     │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │ notifications Slice                           │               │
│  │  Listens to: login, logout, fetchTxn, prices  │               │
│  └──────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ASYNC THUNKS (Data Layer)                     │
│  All loading + error states handled (pending/fulfilled/rejected)│
│  • login / logout (Mock authentication)                         │
│  • fetchTransactions (Mockaroo-style seeded data)               │
│  • fetchCryptoPrices (CoinGecko API)                            │
│  • fetchRates (ExchangeRate-API)                                │
└─────────────────────────────────────────────────────────────────┘
```

## 🗂 Project Structure

```
wealthledger/
├── app/
│   ├── globals.css            # Tailwind v4 theme + utility classes
│   ├── layout.tsx             # Root layout with StoreProvider
│   ├── page.tsx               # Redirect to auth
│   ├── auth/page.tsx          # Login page
│   └── dashboard/page.tsx     # Dashboard page
├── components/
│   ├── smart/                 # State-reading containers (dispatch + selectors only)
│   │   ├── LoginForm.tsx
│   │   ├── TransactionsList.tsx
│   │   ├── CryptoPortfolio.tsx
│   │   ├── CurrencyConverter.tsx
│   │   ├── NetWorthDashboard.tsx
│   │   ├── SpendingInsights.tsx
│   │   └── RecentAlerts.tsx
│   └── dumb/                  # Pure presentational (props only, zero state access)
│       ├── NetWorthCard.tsx
│       ├── AssetBreakdownChart.tsx
│       ├── CryptoPortfolioList.tsx
│       ├── BudgetStatusCard.tsx
│       ├── IncomeExpensesCard.tsx
│       ├── CategorySpendingCard.tsx
│       ├── TransactionsFeed.tsx
│       ├── CategoryFilter.tsx
│       ├── AlertsList.tsx
│       └── CurrencyConverterLayout.tsx
├── lib/
│   ├── store/
│   │   ├── store.ts           # configureStore with middleware
│   │   ├── slices/            # 5 slices (auth, portfolio, currency, transactions, notifications)
│   │   ├── selectors/         # 4 selector files + index.ts barrel
│   │   └── middleware/        # listenerMiddleware + currencyPersistence
│   └── hooks/
│       ├── redux.ts           # Typed useAppDispatch, useAppSelector
│       └── usePricePolling.ts # 60s polling hook
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Login

Use any email and password to log in (mock authentication)

Example:
- Email: `demo@example.com`
- Password: `password`

## ✅ Hard Rules Compliance

### ✅ Thunks own all async work
All API calls are in thunks. Components only `dispatch(thunkName())`. Zero `fetch`/`axios` in `.tsx` files.

### ✅ No derived state in components
All calculations, formatting (`Intl.NumberFormat`), filtered lists, booleans, and Tailwind class selection happen inside `createSelector`. Components just render what selectors return.

### ✅ 3+ cross-slice extraReducers patterns (5 patterns)
| Thunk | Slices Listening |
|-------|-----------------|
| `login` | authSlice, transactionsSlice, notificationsSlice |
| `logout` | authSlice, transactionsSlice, portfolioSlice, currencySlice, notificationsSlice |
| `fetchTransactions` | transactionsSlice, notificationsSlice |
| `fetchCryptoPrices` | portfolioSlice, notificationsSlice |
| `fetchRates` | currencySlice, portfolioSlice |

### ✅ Loading/error on every thunk
All 5 thunks handle `.pending`, `.fulfilled`, and `.rejected` in their owning slice.

### ✅ listenerMiddleware used correctly
Budget alerts fire via `listenerMiddleware.startListening()` on `fetchTransactions.fulfilled`, dispatching `addNotification` cross-slice.

### ✅ Composed selectors (selector of selectors)
- `selectNetWorth` ← `selectPortfolioValue` ← `selectPortfolioValueUSD` + `selectCurrencyState`
- `selectBudgetStatus` ← `selectBudgetUtilization` ← `selectTotalMonthlySpending` ← `selectMonthlySpendingByCategory`
- `selectDashboardLoading` ← `selectPortfolioState` + `selectCurrencyState`

### ✅ Fully typed TypeScript
- `RootState` and `AppDispatch` types
- Typed hooks: `useAppSelector`, `useAppDispatch`
- No `any` types

### ✅ Smart/dumb component separation
- **Smart** (`components/smart/`): Read state via selectors, dispatch actions, delegate layout to dumb components
- **Dumb** (`components/dumb/`): Props-only, zero Redux access, pure presentation

### ✅ Tailwind used consistently — no inline styles
All styling uses Tailwind utility classes via the extended `@theme` block. The only `style={}` usages are for dynamic progress bar widths (`width: ${percentage}%`) which cannot be expressed as static Tailwind classes.

### ✅ Consistent file structure
Slices, selectors, middleware, hooks, smart components, and dumb components each have their own directory.

---

**Built with ❤️ for demonstrating advanced Redux patterns**
