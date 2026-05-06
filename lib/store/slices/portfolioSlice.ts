import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchRates } from './currencySlice';
import { login, logout } from './authSlice';

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

const DEFAULT_HOLDINGS: Holding[] = [
  { symbol: 'BTC', amount: 0.5, purchasePrice: 45000 },
  { symbol: 'ETH', amount: 2.0, purchasePrice: 3000 },
  { symbol: 'SOL', amount: 50, purchasePrice: 100 },
];

const initialState: PortfolioState = {
  holdings: DEFAULT_HOLDINGS,
  cryptoPrices: {},
  loading: false,
  error: null,
};

// Stable fallback prices when CoinGecko API is rate-limited or unreachable.
// Prices are FIXED so net worth doesn't swing on every refresh/poll cycle.
const FALLBACK_PRICES: Record<string, CryptoPrice> = {
  BTC: {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 96500,
    price_change_percentage_24h: 1.24,
  },
  ETH: {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 3350,
    price_change_percentage_24h: 2.15,
  },
  SOL: {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    current_price: 178,
    price_change_percentage_24h: 3.42,
  },
};

// Fetch crypto prices from CoinGecko, with fallback to realistic mock prices
export const fetchCryptoPrices = createAsyncThunk<Record<string, CryptoPrice>>(
  'portfolio/fetchCryptoPrices',
  async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&per_page=3&page=1&sparkline=false'
      );

      if (!response.ok) {
        // CoinGecko rate-limited or down — use fallback
        return FALLBACK_PRICES;
      }

      const data: CryptoPrice[] = await response.json();

      // Convert to map by symbol
      const pricesMap: Record<string, CryptoPrice> = {};
      data.forEach((coin) => {
        const symbol = coin.symbol.toUpperCase();
        pricesMap[symbol] = coin;
      });

      return pricesMap;
    } catch {
      // Network error — use fallback
      return FALLBACK_PRICES;
    }
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
      // CROSS-SLICE: Listen to login — restore default holdings
      .addCase(login.fulfilled, (state) => {
        if (state.holdings.length === 0) {
          state.holdings = DEFAULT_HOLDINGS;
        }
      })
      // CROSS-SLICE: Listen to logout — reset to defaults
      .addCase(logout.fulfilled, (state) => {
        state.holdings = DEFAULT_HOLDINGS;
        state.cryptoPrices = {};
        state.error = null;
      });
  },
});

export const { updateHolding } = portfolioSlice.actions;
export default portfolioSlice.reducer;
