import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, logout } from './authSlice';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'food' | 'transport' | 'entertainment' | 'utilities' | 'shopping' | 'income' | 'other';
  type: 'income' | 'expense';
}

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
};

// Generate seeded mock transactions
const generateMockTransactions = (seed: string): Transaction[] => {
  const categories: Transaction['category'][] = [
    'food', 'transport', 'entertainment', 'utilities', 'shopping', 'income', 'other'
  ];
  
  const descriptions: Record<Transaction['category'], string[]> = {
    food: ['Grocery Store', 'Restaurant', 'Coffee Shop', 'Fast Food'],
    transport: ['Uber', 'Gas Station', 'Public Transit', 'Parking'],
    entertainment: ['Netflix', 'Movie Theater', 'Concert', 'Gaming'],
    utilities: ['Electricity', 'Water Bill', 'Internet', 'Phone Bill'],
    shopping: ['Amazon', 'Clothing Store', 'Electronics', 'Home Goods'],
    income: ['Salary', 'Freelance', 'Bonus', 'Investment'],
    other: ['ATM Withdrawal', 'Transfer', 'Fee', 'Refund'],
  };

  const transactions: Transaction[] = [];
  let currentSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Generate 50 transactions evenly spread over the last 45 days
  for (let i = 0; i < 50; i++) {
    // Better LCG iteration for actual randomness
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const random = currentSeed / 233280;
    
    // Guarantee that at least half fall in the last 15 days, others in the last 45 days
    const daysAgo = i < 25 ? Math.floor(random * 15) : Math.floor(random * 45);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    const category = categories[Math.floor((random * 10) % 7)];
    const isIncome = category === 'income';
    const type: 'income' | 'expense' = isIncome ? 'income' : 'expense';
    
    const descOptions = descriptions[category];
    const description = descOptions[Math.floor((random * 100) % descOptions.length)];
    
    const amount = isIncome 
      ? Math.floor(1000 + random * 4000) 
      : Math.floor(10 + random * 500);

    transactions.push({
      id: `txn_${i}_${currentSeed}`,
      date: date.toISOString().split('T')[0],
      description,
      amount,
      category,
      type,
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const fetchTransactions = createAsyncThunk<Transaction[], string>(
  'transactions/fetch',
  async (userId) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Generate seeded transactions based on user ID
    return generateMockTransactions(userId);
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      // CROSS-SLICE PATTERN #1: Listen to login success
      .addCase(login.pending, (state) => {
        // When user logs in, clear old transactions
        state.items = [];
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.items = [];
        state.error = null;
      });
  },
});

export const { clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;
