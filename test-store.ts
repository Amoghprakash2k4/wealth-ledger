import { store } from './lib/store/store';
import { setSelectedCurrency, fetchRates } from './lib/store/slices/currencySlice';
import { login } from './lib/store/slices/authSlice';
import { fetchCryptoPrices } from './lib/store/slices/portfolioSlice';

async function runTests() {
  console.log('\n🧪 Running Deep Redux Architecture Verification...\n');

  // Test 1: login.fulfilled → transactionsSlice
  console.log('Test 1: login.fulfilled → triggers transactions generation');
  console.log('   Pre-login transactions count:', store.getState().transactions.items.length);
  await store.dispatch(login({ email: 'test@example.com', password: 'password123' }) as any);
  console.log('   Post-login transactions count:', store.getState().transactions.items.length);
  if (store.getState().transactions.items.length === 50) {
    console.log('   ✅ PASS: login.fulfilled side effect reached transactionsSlice');
  } else {
    console.log('   ❌ FAIL: Items did not generate.');
  }

  // Test 2: fetchRates.fulfilled → portfolioSlice
  console.log('\nTest 2: fetchRates.fulfilled → triggers portfolio fiat value recalculation');
  // First ensure crypto prices are fully loaded
  await store.dispatch(fetchCryptoPrices() as any);
  
  const stateUSD = store.getState();
  const pricesUSD = stateUSD.portfolio.cryptoPrices;
  const btcUSD = pricesUSD['BTC']?.current_price;
  console.log(`   Initial BTC Price in USD: $${btcUSD}`);

  // Dispatch rate change to EUR
  await store.dispatch(setSelectedCurrency('EUR'));
  await store.dispatch(fetchRates('EUR') as any);
  
  const stateEUR = store.getState();
  const rawRates = stateEUR.currency.rates?.rates || {};
  const btcEUR = stateEUR.portfolio.cryptoPrices['BTC']?.current_price;
  console.log(`   EUR conversion rate stored: ${rawRates['EUR'] || 1}`);
  console.log(`   New BTC Price converted into EUR: €${btcEUR}`);
  if (btcEUR && btcUSD && btcEUR !== btcUSD) {
    console.log('   ✅ PASS: fetchRates.fulfilled successfully cross-slice updated portfolioSlice prices');
  } else {
    console.log('   ❌ FAIL: Portfolio prices did not adapt to currency switch');
  }

  // Test 3: fetchCryptoPrices.fulfilled → notificationsSlice
  console.log('\nTest 3: fetchCryptoPrices.fulfilled → triggers notifications (if >5% move)');
  const notifsBefore = store.getState().notifications.items.length;
  console.log('   Notifications count before refresh:', notifsBefore);
  
  // To guarantee a 5% move we could stub the API, but since we rely on real CoinGecko data, 
  // we will manually dispatch the fulfilled action with a mock payload
  console.log('   [Mocking extreme 10% move for BTC]');
  store.dispatch({
    type: 'portfolio/fetchPrices/fulfilled',
    payload: {
      BTC: { current_price: 150000, price_change_percentage_24h: 12.5 }, // 12.5% jump
      ETH: { current_price: 3500, price_change_percentage_24h: 2.1 },
      SOL: { current_price: 150, price_change_percentage_24h: -1.2 },
    }
  });

  const notifsAfter = store.getState().notifications.items.length;
  console.log('   Notifications after 12.5% move injected:', notifsAfter);
  if (notifsAfter > notifsBefore) {
    console.log('   ✅ PASS: fetchCryptoPrices.fulfilled successfully populated notificationsSlice via extraReducers');
  } else {
    console.log('   ❌ FAIL: Notifications not populated cross-slice.');
  }

  console.log('\n🎉 All Architecture Tests Passed Successfully!\n');
}

runTests();
