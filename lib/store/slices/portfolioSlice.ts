import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchRates } from './currencySlice';
import { logout } from './authSlice';

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export interface Holding {
  symbol: string;
  amount: number;
  purchasePrice: number;
}

interface PortfolioState {
  holdings: Holding[];
  cryptoPrices: Record<string, CryptoPrice>;
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  holdings: [
    { symbol: 'BTC', amount: 0.5, purchasePrice: 45000 },
    { symbol: 'ETH', amount: 2.0, purchasePrice: 3000 },
    { symbol: 'SOL', amount: 50, purchasePrice: 100 },
  ],
  cryptoPrices: {},
  loading: false,
  error: null,
};

// Fetch crypto prices from CoinGecko
export const fetchCryptoPrices = createAsyncThunk<Record<string, CryptoPrice>>(
  'portfolio/fetchCryptoPrices',
  async () => {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&per_page=3&page=1&sparkline=false'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices');
    }

    const data: CryptoPrice[] = await response.json();
    
    // Convert to map by symbol
    const pricesMap: Record<string, CryptoPrice> = {};
    data.forEach((coin) => {
      const symbol = coin.symbol.toUpperCase();
      pricesMap[symbol] = coin;
    });

    return pricesMap;
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    updateHolding: (
      state,
      action: PayloadAction<{ symbol: string; amount: number }>
    ) => {
      const holding = state.holdings.find(
        (h) => h.symbol === action.payload.symbol
      );
      if (holding) {
        holding.amount = action.payload.amount;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch crypto prices
      .addCase(fetchCryptoPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptoPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.cryptoPrices = action.payload;
      })
      .addCase(fetchCryptoPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prices';
      })
      // CROSS-SLICE PATTERN #2: Listen to currency rate updates
      // When exchange rates are fetched, we might need to recalculate converted values
      .addCase(fetchRates.fulfilled, (state) => {
        // Portfolio acknowledges new rates are available
        // In a real app, this might trigger recalculation of converted portfolio value
        state.error = null; // Clear any previous errors related to conversion
      })
      // CROSS-SLICE: Listen to logout
      .addCase(logout.fulfilled, (state) => {
        state.holdings = [];
        state.cryptoPrices = {};
        state.error = null;
      });
  },
});

export const { updateHolding } = portfolioSlice.actions;
export default portfolioSlice.reducer;
