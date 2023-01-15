// Element variables
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-input");
const searchMessage = document.querySelector(".search-message");
const stockCardsContainer = document.querySelector(".stockcards-container");
// Time variables
const currentDateTime = new Date().getTime(); // Unix timestamp in milliseconds
const currentTimestamp = Math.floor(currentDateTime / 1000);
const oneDayTime = 1000 * 60 * 60 * 24; // Milliseconds in a day
const fiveYearsAgoDateTime = currentDateTime - oneDayTime * 365 * 5;
const fiveYearsAgoTimestamp = Math.floor(fiveYearsAgoDateTime / 1000);
// Stock variable
let stocksList = JSON.parse(localStorage.getItem("stocks")) || [];

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
const clearSearchInput = () => (searchInput.value = "");

const checkSearchInput = () => {
  const newStock = searchInput.value;
  if (!newStock) {
    renderMessage("no-input");
    return;
  }
  return newStock;
};

const updateLocalStorage = () =>
  localStorage.setItem("stocks", JSON.stringify(stocksList));

const updateStocksList = (newStock) => {
  if (!newStock) return;

  if (stocksList.includes(newStock)) return;
  if (stocksList.length === 6) stocksList.pop();

  stocksList.unshift(newStock);
  clearSearchInput();
  updateLocalStorage();
};

const removeWrongStock = () => {
  stocksList.shift();
  updateLocalStorage();
};

const calculateMovingAverage = (array, number) => {
  let sum = 0;
  for (let i = array.length - 1; i >= array.length - number; i--) {
    sum += array[i];
  }
  return (sum / number).toFixed(2);
};

const numberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const renderMessage = (status) => {
  searchMessage.innerHTML = "";

  let markup = "";
  if (status === "no-input") markup = "<p>Please enter a stock symbol.</p>";
  if (status === "error")
    markup = "<p>No search results found for your query. Please try again.</p>";
  if (status === "no-data")
    markup = "<p>No data for this stock. Please try another stock.</p>";

  searchMessage.insertAdjacentHTML("afterbegin", markup);
};

const generateStockCardMarkup = (
  currency,
  symbol,
  lastestPrice,
  changeNumber,
  changePercentage,
  ma240,
  ma1200
) => {
  return (markup = `
        <div class="stock-card">
            <div class="stock-info">
                <div class="stock-symbol">
                    <h2><a href="https://www.google.com/search?q=${symbol}" target="_blank" rel="noopener noreferrer">${symbol}</a></h2>
                </div>
                <div class="stock-price ${
                  changeNumber > 0 ? "green" : changeNumber < 0 ? "red" : ""
                }">
                    <div class="price">
                        <h2>${numberWithCommas(lastestPrice)} ${currency}</h2>
                    </div>
                    <div class="change">
                        <h4>${changeNumber} (${changePercentage})</h4>
                    </div>
                </div>
            </div>
            <div class="moving-average">
                <div class="ma240 ${+lastestPrice <= +ma240 && "buy-point"}">
                    <h4>MA240</h4>
                    <h3>${numberWithCommas(ma240)}</h3>
                </div>
                <div class="ma1200 ${+lastestPrice <= +ma1200 && "buy-point"}">
                    <h4>MA1200</h4>
                    <h3>${numberWithCommas(ma1200)}</h3>
                </div>
            </div>
        </div>
    `);
};

const getApiUrls = (stocks) =>
  stocks.map(
    (stock) =>
      `https://query1.finance.yahoo.com/v8/finance/chart/${stock}?period1=${fiveYearsAgoTimestamp}&period2=${currentTimestamp}&interval=1d`
  );

const fetchStockData = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    renderMessage("error");
    removeWrongStock();
    return;
  }

  const data = await response.json();
  return data.chart.result;
};

const getAllStocksDataAndRenderCards = async (stocks) => {
  const urls = getApiUrls(stocks);
  const data = await Promise.all(urls.map((api) => fetchStockData(api)));

  data.map((stock) => {
    // Fix error caused by 404 (no stock found)
    if (!stock) return;

    // Fix error of imcomplete stock data
    if (!stock[0].meta.currency) {
      renderMessage("no-data");
      removeWrongStock();
      return;
    }

    const { indicators, meta } = stock[0];
    const currency = meta.currency;
    const symbol = meta.symbol;
    const historyPrice = indicators.quote[0].close;
    const lastestPrice = meta.regularMarketPrice.toFixed(2);
    const previousPrice = historyPrice[historyPrice.length - 2].toFixed(2);
    const change = lastestPrice - previousPrice;
    const changeIcon = change > 0 ? "+" : "";
    const changeNumber = `${changeIcon}${change.toFixed(2)}`;
    const changePercentage = `${changeIcon}${(
      (change / previousPrice) *
      100
    ).toFixed(2)}%`;
    // const ma120 = calculateMovingAverage(historyPrice, 120);
    const ma240 = calculateMovingAverage(historyPrice, 240);
    const ma1200 = calculateMovingAverage(historyPrice, 1200);

    const markup = generateStockCardMarkup(
      currency,
      symbol,
      lastestPrice,
      changeNumber,
      changePercentage,
      ma240,
      ma1200
    );
    stockCardsContainer.insertAdjacentHTML("beforeend", markup);
  });
};

// Onload
getAllStocksDataAndRenderCards(stocksList);

// Event listener
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  updateStocksList(checkSearchInput());
  stockCardsContainer.innerHTML = "";
  getAllStocksDataAndRenderCards(stocksList);
});
