import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

interface CurrencyState {
  selectedCurrency: string;
  rates: ExchangeRates | null;
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyState = {
  selectedCurrency: 'USD',
  rates: null,
  loading: false,
  error: null,
};

// Fetch exchange rates from ExchangeRate-API
export const fetchRates = createAsyncThunk<ExchangeRates, string>(
  'currency/fetchRates',
  async (baseCurrency) => {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    return {
      base: data.base,
      rates: data.rates,
      lastUpdated: new Date().toISOString(),
    };
  }
);

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setSelectedCurrency: (state, action: PayloadAction<string>) => {
      state.selectedCurrency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRates.fulfilled, (state, action) => {
        state.loading = false;
        state.rates = action.payload;
      })
      .addCase(fetchRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch rates';
      })
      // CROSS-SLICE: Listen to logout
      .addCase(logout.fulfilled, (state) => {
        state.selectedCurrency = 'USD';
        state.rates = null;
        state.error = null;
      });
  },
});

export const { setSelectedCurrency } = currencySlice.actions;
export default currencySlice.reducer;
