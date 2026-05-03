'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import { selectFilteredTransactions } from '@/lib/store/selectors/transactionsSelectors';
import { CategoryFilter } from '../dumb/CategoryFilter';
import { TransactionsFeed } from '../dumb/TransactionsFeed';

/**
 * SMART COMPONENT: Transaction Feed (FEATURE 02)
 * - Filtering via createSelector (no logic in component)
 * - Layout delegated to dumb components
 */
export function TransactionsList() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const displayTransactions = useAppSelector((state) =>
    selectFilteredTransactions(state, selectedCategory)
  );
  const loading = useAppSelector((state) => state.transactions.loading);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Transactions</h2>
          <p className="text-xs mt-0.5 text-text-muted">
            {displayTransactions.length} records
          </p>
        </div>
      </div>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <TransactionsFeed transactions={displayTransactions} loading={loading} />
    </div>
  );
}
