// Time variables
const currentDateTime = new Date().getTime(); // Unix timestamp in milliseconds
const currentTimestamp = Math.floor(currentDateTime / 1000);
const oneDayTime = 1000 * 60 * 60 * 24; // Milliseconds in a day
const fiveYearsAgoDateTime = currentDateTime - oneDayTime * 365 * 5;
const fiveYearsAgoTimestamp = Math.floor(fiveYearsAgoDateTime / 1000);
// Fetch api variables
const cors_api_host = 'https://cors-anywhere.herokuapp.com/'; // Use cors-anywhere to fetch api data
const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/voo?period1=${fiveYearsAgoTimestamp}&period2=${currentTimestamp}&interval=1d`;
console.log(apiUrl);

// Object
const stockPrice = {
    lastestPrice: '',
    previousPrice: '',
    ma120: '', // Moving average of 6 months
    ma240: '', // Moving average of 1 year
    ma1200: '', // Moving average of 5 years
    historyPrice: [],
};

// Functions
async function fetchStockData() {
    const response = await fetch(cors_api_host + apiUrl);
    const data = await response.json();
    const { indicators, meta } = data.chart.result[0];

    stockPrice.historyPrice = indicators.quote[0].close;
    stockPrice.lastestPrice = meta.regularMarketPrice.toFixed(2);
    stockPrice.previousPrice = stockPrice.historyPrice[stockPrice.historyPrice.length - 2].toFixed(2);
    stockPrice.ma120 = calculateMovingAverage(stockPrice.historyPrice, 120);
    stockPrice.ma240 = calculateMovingAverage(stockPrice.historyPrice, 240);
    stockPrice.ma1200 = calculateMovingAverage(stockPrice.historyPrice, 1200);
}

function calculateMovingAverage(array, number) {
    let sum = 0;
    // console.log(array.length - 1, array.length - number);
    for (let i = array.length - 1; i >= array.length - number; i--) {
        sum += array[i];
    }
    return (sum / number).toFixed(2);
}

// Onload
fetchStockData();