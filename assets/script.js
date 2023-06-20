// Global variables
var apiKey = 'b745135e4607b89aed48f6470c055a10';
var apiUrl = 'https://api.openweathermap.org/data/2.5';

var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var currentWeatherContainer = document.querySelector('#current-weather-container');
var forecastContainer = document.querySelector('#forecast-container');
var searchHistoryContainer = document.querySelector('#search-history-container');

let searchHistory = [];

// Function to save search history, it saves the searched city in the searchHistory array and calls getSearchHistory() to update the webpage
function saveSearchHistory(city) {
    searchHistory.push(city);
    getSearchHistory(); // Call getSearchHistory  after saving the search
}

// Function to get search history, this function updates the search history on the webpage by iterating over the searchHistory array and creating div elements for each city
function getSearchHistory() {
    searchHistoryContainer.innerHTML = '';

    searchHistory.forEach((city) => {
        var searchItem = document.createElement('div');
        searchItem.textContent = city;
        searchItem.addEventListener('click', () => { // Clicking on a search history item will call the getWeatherData() to fetch the weather data for that city
            getWeatherData(city);
        });
        searchHistoryContainer.appendChild(searchItem);
    });
}

// This code adds an event listener to the search forms submit event, when the form is submitted it prevents the default form submission behavior which is to refresh the page
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    var city = searchInput.value.trim();  //Extracts the city value from the search input
    if (city) {
        getWeatherData(city);  // Calls getWeatherData() to fetch weather data for the entered city
        searchInput.value = '';  // Clears the search input so another city can be input 


        saveSearchHistory(city); // Save the search history
    }
});

// This function fetches the current weather data for a given city by making an API call to OpenWeatherMap
function getWeatherData(city) {
    fetch(`${apiUrl}/weather?q=${city}&appid=${apiKey}`)
        .then((response) => response.json()) // It then processes the received data, updates the current weather on the webpage, and calls getForecastData() to fetch the forecast data for the same location
        .then((data) => {
            var currentWeather = processCurrentWeather(data);
            updateCurrentWeatherUI(currentWeather);
            getForecastData(data.coord.lat, data.coord.lon);
        });
}

// Extract needed information from the received weather data, this function processes the current weather data received from the API response, it extracts relevant information such as city name, date, weather icon, temperature, humidity, and wind speed, and returns an object containing these values
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

//  This function updates the current weather on the webpage by creating an html string with the received weather data and setting the inner text of that content to the fetched weather data 
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


// This function fetches the forecast data for a given latitude and longitude, it makes an API call to OpenWeatherMap's forecast endpoint and processes the received data by calling processForecastData()
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

//
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
    //  This function processes the forecast data received from the API response, it groups the forecast items by date, selects the first forecast item for each date, and creates html for displaying the forecast information
    for (var date in forecastByDate) {
        var forecasts = forecastByDate[date];
        var forecast = forecasts[0]; // Get the first forecast item for each date

        var icon = forecast.weather[0].icon;
        var temperature = kelvinToCelsius(forecast.main.temp);
        var humidity = forecast.main.humidity;
        var windSpeed = forecast.wind.speed;

        // This code uses a template literal string to change the inner text and store the data on the webpage 
        var forecastHTML = `
      <div class="forecast-item">
        <p>Date: ${date}</p>
        <img src="http://openweathermap.org/img/w/${icon}.png" alt="Weather Icon">
        <p>Temperature: ${temperature} °C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
      </div>
    `;

        forecastContainer.innerHTML += forecastHTML; //  This appends the template literal string to the forecastContainer in the html
    }
}

// Convert Kelvin to Fahrenheit 
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

getSearchHistory(); //() calls the function
