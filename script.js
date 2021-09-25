// Element variables
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-input');
const searchMessage = document.querySelector('.search-message');
const stocksContainer = document.querySelector('.stocks-containter');
// Time variables
const currentDateTime = new Date().getTime(); // Unix timestamp in milliseconds
const currentTimestamp = Math.floor(currentDateTime / 1000);
const oneDayTime = 1000 * 60 * 60 * 24; // Milliseconds in a day
const fiveYearsAgoDateTime = currentDateTime - oneDayTime * 365 * 5;
const fiveYearsAgoTimestamp = Math.floor(fiveYearsAgoDateTime / 1000);
// Stock variable
let stocksList = JSON.parse(localStorage.getItem('stock')) || [];

// Solutions for fixing CORS error
/* Solution 1
Use cors-anywhere(https://github.com/Rob--W/cors-anywhere) to fetch api data, but need request temporarily unlock access to the demo: https://cors-anywhere.herokuapp.com/corsdemo

const cors_api_host = 'https://cors-anywhere.herokuapp.com/';
const response = await fetch(cors_api_host + apiUrl);
*/
/* Solution 2
Use chrome widget: CORS Unblock(https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino/related)
*/

// Functions
const updateLocalStorage = () => localStorage.setItem('stocks', JSON.stringify(stocksList));

const updateStockList = () => {
    const newStock = searchInput.value;
    if (stocksList.includes(newStock)) return;

    if (stocksList.length === 3) stocksList.pop();
    stocksList.unshift(newStock);
    searchInput.value = '';
    updateLocalStorage();
};

const calculateMovingAverage = (array, number) => {
    let sum = 0;
    for (let i = array.length - 1; i >= array.length - number; i--) {
        sum += array[i];
    }
    return (sum / number).toFixed(2);
};

const renderBuyIn = () => {
    const { lastestPrice, ma240 } = stockPrice;
    if (lastestPrice <= ma240) {
        // .style.color='';
        // .style.bakcgroundColor='';
    }
};

const renderMessage = (status) => {
    if (status === 'error') return `<p>No search results found for your query. Please try again.</p>`;
    if (status === 'success') return '';
}

const renderMarkup = (currency, symbol, lastestPrice, changeNumber, changePercentage, ma240, ma1200) => {
    // return markup = ``;
};

const getApiUrls = (stocks) => stocks.map(stock => `https://query1.finance.yahoo.com/v8/finance/chart/${stock}?period1=${fiveYearsAgoTimestamp}&period2=${currentTimestamp}&interval=1d`);

const fetchStockData = async (url) => {
    searchMessage.innerHTML = '';

    const response = await fetch(url);

    if (!response.ok) {
        const markup = renderMessage('error');
        searchMessage.insertAdjacentHTML('afterbegin', markup);
        stocksList.shift();
        updateLocalStorage();
        return;
    }

    const markup = renderMessage('success');
    searchMessage.insertAdjacentHTML('afterbegin', markup);

    const data = await response.json();
    return data.chart.result;
};

const getAllStocksData = async (stocks) => {
    const urls = getApiUrls(stocks);
    const data = await Promise.all(urls.map(api => fetchStockData(api)));

    data.map(stock => {
        const { indicators, meta } = stock[0];
        const currency = meta.currency;
        const symbol = meta.symbol;
        const historyPrice = indicators.quote[0].close;
        const lastestPrice = meta.regularMarketPrice.toFixed(2);
        const previousPrice = historyPrice[historyPrice.length - 2].toFixed(2);
        const change = lastestPrice - previousPrice;
        const changeIcon = change > 0 ? '+' : change < 0 ? '-' : ' ';
        const changeNumber = `${changeIcon}${change.toFixed(2)}`;
        const changePercentage = `${changeIcon}${(change / previousPrice).toFixed(2) * 100}%`;
        // const ma120 = calculateMovingAverage(historyPrice, 120);
        const ma240 = calculateMovingAverage(historyPrice, 240);
        const ma1200 = calculateMovingAverage(historyPrice, 1200);

        const markup = renderMarkup(currency, symbol, lastestPrice, changeNumber, changePercentage, ma240, ma1200);
        // stocksContainer.insertAdjacentHTML('afterbegin', markup);
    });
};

// Event Listener
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    updateStockList();
    getAllStocksData(stocksList);
});