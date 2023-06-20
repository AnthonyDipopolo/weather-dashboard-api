var apiKey = 'b745135e4607b89aed48f6470c055a10';
var apiUrl = 'https://api.openweathermap.org/data/2.5';

var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var currentWeatherContainer = document.querySelector('#current-weather-container');
var forecastContainer = document.querySelector('#forecast-container');
var searchHistoryContainer = document.querySelector('#search-history-container');

let searchHistory = [];

// Function to save search history
function saveSearchHistory(city) {
    searchHistory.push(city);
    getSearchHistory(); // Call getSearchHistory  after saving the search
}

// Function to get search history
function getSearchHistory() {
    searchHistoryContainer.innerHTML = '';

    searchHistory.forEach((city) => {
        var searchItem = document.createElement('div');
        searchItem.textContent = city;
        searchItem.addEventListener('click', () => {
            getWeatherData(city);
        });
        searchHistoryContainer.appendChild(searchItem);
    });
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    var city = searchInput.value.trim();

    if (city) {
        getWeatherData(city);
        searchInput.value = '';

        saveSearchHistory(city); // Save the search history
    }
});

function getWeatherData(city) {
    fetch(`${apiUrl}/weather?q=${city}&appid=${apiKey}`)
        .then((response) => response.json())
        .then((data) => {
            var currentWeather = processCurrentWeather(data);
            updateCurrentWeatherUI(currentWeather);
            getForecastData(data.coord.lat, data.coord.lon);
        });
}

function processCurrentWeather(data) {
    var city = data.name;
    var date = new Date(data.dt * 1000);
    var icon = data.weather[0].icon;
    var temperature = kelvinToCelsius(data.main.temp);
    var humidity = data.main.humidity;
    var windSpeed = data.wind.speed;

    return {
        city,
        date,
        icon,
        temperature,
        humidity,
        windSpeed,
    };
}

function updateCurrentWeatherUI(weather) {
    var weatherHTML = `
    <h2>${weather.city}</h2>
    <p>Date: ${weather.date}</p>
    <img src="http://openweathermap.org/img/w/${weather.icon}.png" alt="Weather Icon">
    <p>Temperature: ${weather.temperature} °C</p>
    <p>Humidity: ${weather.humidity}%</p>
    <p>Wind Speed: ${weather.windSpeed} m/s</p>
  `;

    currentWeatherContainer.innerHTML = weatherHTML;
}

function getForecastData(lat, lon) {
    fetch(`${apiUrl}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then((response) => response.json())
        .then((data) => {
            processForecastData(data.list);
        })
        .catch((error) => {
            console.log('Error fetching forecast data:', error);
        });
}

function processForecastData(forecastData) {
    forecastContainer.innerHTML = '';

    // Create an object to store the forecast items by date
    var forecastByDate = {};

    // Group the forecast items by date
    forecastData.forEach((forecast) => {
        var date = new Date(forecast.dt * 1000).toLocaleDateString();

        // If the date does not exist in the forecastByDate object, create an array for that date
        if (!forecastByDate[date]) {
            forecastByDate[date] = [];
        }

        // Add the forecast item to the array of the corresponding date
        forecastByDate[date].push(forecast);
    });

    // Loop over the forecastByDate object and display only one forecast item per date
    for (var date in forecastByDate) {
        var forecasts = forecastByDate[date];
        var forecast = forecasts[0]; // Get the first forecast item for each date

        var icon = forecast.weather[0].icon;
        var temperature = kelvinToCelsius(forecast.main.temp);
        var humidity = forecast.main.humidity;
        var windSpeed = forecast.wind.speed;

        var forecastHTML = `
      <div class="forecast-item">
        <p>Date: ${date}</p>
        <img src="http://openweathermap.org/img/w/${icon}.png" alt="Weather Icon">
        <p>Temperature: ${temperature} °C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
      </div>
    `;

        forecastContainer.innerHTML += forecastHTML;
    }
}

// Convert Kelvin to Fahrenheit 
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

getSearchHistory();
