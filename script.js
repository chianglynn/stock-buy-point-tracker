// Time variables
const currentDateTime = new Date().getTime(); // Unix timestamp in milliseconds
const currentTimestamp = Math.floor(currentDateTime / 1000);
const oneDayTime = 1000 * 60 * 60 * 24; // Milliseconds in a day
const fiveYearsAgoDateTime = currentDateTime - oneDayTime * 365 * 5;
const fiveYearsAgoTimestamp = Math.floor(fiveYearsAgoDateTime / 1000);
// Fetch api variable
const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/voo?period1=${fiveYearsAgoTimestamp}&period2=${currentTimestamp}&interval=1d`;
console.log(apiUrl);

// Solutions for fixing CORS error
/* Solution 1
Use cors-anywhere(https://github.com/Rob--W/cors-anywhere) to fetch api data, but need request temporarily unlock access to the demo: https://cors-anywhere.herokuapp.com/corsdemo

const cors_api_host = 'https://cors-anywhere.herokuapp.com/';
const response = await fetch(cors_api_host + apiUrl);
*/
/* Solution 2
Use chrome widget: CORS Unblock(https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino/related)
*/

// Object
let stockPrice = {
    currency: '',
    symbol: '',
    historyPrice: [],
    lastestPrice: '',
    previousPrice: '',
    change: '',
    // ma120: '', // Moving average of 6 months
    ma240: '', // Moving average of 1 year
    ma1200: '', // Moving average of 5 years
};

// Functions
async function fetchStockData() {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const { indicators, meta } = data.chart.result[0];

    const currency = meta.currency;
    const symbol = meta.symbol;
    const historyPrice = indicators.quote[0].close;
    const lastestPrice = meta.regularMarketPrice.toFixed(2);
    const previousPrice = historyPrice[historyPrice.length - 2].toFixed(2);
    const change = `${(lastestPrice - previousPrice) > 0 ? '+' : (lastestPrice - previousPrice) < 0 ? '-' : ' '}${((lastestPrice - previousPrice) / previousPrice * 100).toFixed(2)}%`;
    // const ma120 = calculateMovingAverage(historyPrice, 120);
    const ma240 = calculateMovingAverage(historyPrice, 240);
    const ma1200 = calculateMovingAverage(historyPrice, 1200);

    stockPrice = { ...stockPrice, currency, symbol, historyPrice, lastestPrice, previousPrice, change/*, ma120*/, ma240, ma1200 };
}

function calculateMovingAverage(array, number) {
    let sum = 0;
    for (let i = array.length - 1; i >= array.length - number; i--) {
        sum += array[i];
    }
    return (sum / number).toFixed(2);
}

// Onload
fetchStockData();