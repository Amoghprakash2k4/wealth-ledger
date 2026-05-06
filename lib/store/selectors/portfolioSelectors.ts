import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const fmtCurrency = (v: number, currency: string, compact = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: compact ? 'compact' : 'standard',
  }).format(v);

// Base selectors
const selectPortfolioState = (state: RootState) => state.portfolio;
const selectCurrencyState = (state: RootState) => state.currency;
const selectTransactions = (state: RootState) => state.transactions.items;

// Selector: Portfolio value in USD
export const selectPortfolioValueUSD = createSelector(
  [selectPortfolioState],
  (portfolio) => {
    const { holdings, cryptoPrices } = portfolio;

    let totalValue = 0;

    holdings.forEach((holding) => {
      const price = cryptoPrices[holding.symbol];
      if (price) {
        totalValue += holding.amount * price.current_price;
      }
    });

    return totalValue;
  }
);

// Selector: Portfolio value in selected currency
export const selectPortfolioValue = createSelector(
  [selectPortfolioValueUSD, selectCurrencyState],
  (valueUSD, currencyState) => {
    const { selectedCurrency, rates } = currencyState;

    if (!rates || selectedCurrency === 'USD') {
      return valueUSD;
    }

    const rate = rates.rates[selectedCurrency];
    if (!rate) return valueUSD;

    return valueUSD * rate;
  }
);

// Selector: Portfolio breakdown by asset
export const selectPortfolioBreakdown = createSelector(
  [selectPortfolioState, selectCurrencyState],
  (portfolio, currencyState) => {
    const { holdings, cryptoPrices } = portfolio;
    const { selectedCurrency, rates } = currencyState;

    const rate = (rates && selectedCurrency !== 'USD') ? rates.rates[selectedCurrency] || 1 : 1;

    return holdings.map((holding) => {
      const price = cryptoPrices[holding.symbol];
      const baseCurrentPrice = price?.current_price || 0;
      const baseCurrentValue = price ? holding.amount * baseCurrentPrice : 0;
      const basePurchaseValue = holding.amount * holding.purchasePrice;
      const baseProfitLoss = baseCurrentValue - basePurchaseValue;

      const currentPrice = baseCurrentPrice * rate;
      const currentValue = baseCurrentValue * rate;
      const purchaseValue = basePurchaseValue * rate;
      const profitLoss = baseProfitLoss * rate;

      const profitLossPercent = basePurchaseValue > 0 
        ? (baseProfitLoss / basePurchaseValue) * 100 
        : 0;
      const priceChange24h = price?.price_change_percentage_24h || 0;

      const isUp = priceChange24h >= 0;
      const plUp = profitLoss >= 0;

      return {
        symbol: holding.symbol,
        amount: holding.amount,
        currentPrice,
        currentPriceFormatted: fmtCurrency(currentPrice, selectedCurrency),
        currentValue,
        currentValueFormatted: fmtCurrency(currentValue, selectedCurrency),
        purchaseValue,
        purchaseValueFormatted: fmtCurrency(purchaseValue, selectedCurrency),
        profitLoss,
        profitLossFormatted: `${plUp ? '+' : ''}${fmtCurrency(profitLoss, selectedCurrency)}`,
        profitLossPercent,
        profitLossPercentFormatted: `${plUp ? '+' : ''}${profitLossPercent.toFixed(1)}%`,
        priceChange24h,
        priceChange24hFormatted: `${isUp ? '▲' : '▼'} ${Math.abs(priceChange24h).toFixed(2)}%`,
        isUp,
        plUp,
      };
    });
  }
);

// Selector: Total profit/loss
export const selectTotalProfitLoss = createSelector(
  [selectPortfolioBreakdown, selectCurrencyState],
  (breakdown, currencyState) => {
    const { selectedCurrency } = currencyState;
    const totalProfit = breakdown.reduce((sum, asset) => sum + asset.profitLoss, 0);
    const totalPurchaseValue = breakdown.reduce(
      (sum, asset) => sum + asset.purchaseValue,
      0
    );
    const percentChange = totalPurchaseValue > 0 
      ? (totalProfit / totalPurchaseValue) * 100 
      : 0;

    const plPositive = totalProfit >= 0;

    return {
      amount: totalProfit,
      amountFormatted: `${plPositive ? '+' : ''}${fmtCurrency(totalProfit, selectedCurrency)}`,
      percentage: percentChange,
      percentageFormatted: `${plPositive ? '+' : ''}${percentChange.toFixed(2)}%`,
      plPositive,
    };
  }
);

// Selector: Cash balance from transactions
export const selectCashBalance = createSelector(
  [selectTransactions],
  (transactions) => {
    const income = transactions
      .filter((txn) => txn.type === 'income')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const expenses = transactions
      .filter((txn) => txn.type === 'expense')
      .reduce((sum, txn) => sum + txn.amount, 0);

    return income - expenses;
  }
);

// Selector: Net worth (FEATURE 05)
export const selectNetWorth = createSelector(
  [selectPortfolioValue, selectCashBalance, selectCurrencyState],
  (portfolioValue, cashBalance, currencyState) => {
    const { selectedCurrency, rates } = currencyState;
    
    let convertedCash = cashBalance;
    
    // Convert cash balance if not in USD
    if (rates && selectedCurrency !== 'USD') {
      const rate = rates.rates[selectedCurrency];
      if (rate) {
        convertedCash = cashBalance * rate;
      }
    }

    const total = portfolioValue + convertedCash;

    return {
      total,
      totalFormatted: fmtCurrency(total, selectedCurrency),
      portfolio: portfolioValue,
      portfolioFormatted: fmtCurrency(portfolioValue, selectedCurrency),
      cash: convertedCash,
      cashFormatted: fmtCurrency(convertedCash, selectedCurrency),
      currency: selectedCurrency,
    };
  }
);

// Selector: Asset allocation percentages
export const selectAssetAllocation = createSelector(
  [selectPortfolioBreakdown, selectPortfolioValue, selectCashBalance, selectCurrencyState],
  (breakdown, portfolioValue, cashBalance, currencyState) => {
    const { selectedCurrency, rates } = currencyState;
    
    let convertedCash = cashBalance;
    if (rates && selectedCurrency !== 'USD') {
      const rate = rates.rates[selectedCurrency];
      if (rate) {
        convertedCash = cashBalance * rate;
      }
    }

    const totalNetWorth = portfolioValue + convertedCash;

    const allocation = breakdown.map((asset) => {
      const percentage = totalNetWorth > 0 ? (asset.currentValue / totalNetWorth) * 100 : 0;
      return {
        symbol: asset.symbol,
        value: asset.currentValue,
        valueFormatted: fmtCurrency(asset.currentValue, selectedCurrency),
        percentage,
        percentageFormatted: `${percentage.toFixed(1)}%`,
      };
    });

    const cashPercentage = totalNetWorth > 0 ? (convertedCash / totalNetWorth) * 100 : 0;

    return {
      crypto: allocation,
      cash: {
        value: convertedCash,
        valueFormatted: fmtCurrency(convertedCash, selectedCurrency),
        percentage: cashPercentage,
        percentageFormatted: `${cashPercentage.toFixed(1)}%`,
      },
    };
  }
);

export const selectPortfolioLoading = createSelector(
  [selectPortfolioState],
  (state) => state.loading
);

export const selectPortfolioError = createSelector(
  [selectPortfolioState],
  (state) => state.error
);

// Selector: Combined loading state for the dashboard
export const selectDashboardLoading = createSelector(
  [selectPortfolioState, selectCurrencyState],
  (portfolio, currency) => portfolio.loading || currency.loading
);
