"use strict";

const API_KEY = "c30a42ab6cb71264fea6b38f2531ad66";

const dayEl = document.querySelector(".default_day");
const dateEl = document.querySelector(".default_date");
const btnEl = document.querySelector(".btn_search");
const inputEl = document.querySelector(".input_field");

const iconsContainer = document.querySelector(".icons");
const dayInfoEl = document.querySelector(".day_info");
const listContentEl = document.querySelector(".list_content ul");

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Display the day
const today = new Date();
const dayName = days[today.getDay()];
dayEl.textContent = dayName;

// Display the date
let month = today.toLocaleString("default", { month: "long" });
let date = today.getDate();
let year = today.getFullYear();
dateEl.textContent = `${date} ${month} ${year}`;

// Add event listener to search button
btnEl.addEventListener("click", async (e) => {
  e.preventDefault();

  // Check if input field is not empty
  if (inputEl.value.trim() !== "") {
    const search = inputEl.value.trim();
    inputEl.value = "";
    findLocation(search);
  } else {
    console.log("Please enter a city or country name.");
  }
});

// Function to find location based on user input or geolocation
async function findLocation(location) {
  try {
    let API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
    
    // If no location is provided, try to get user's geolocation
    if (!location) {
      const position = await getCurrentPosition();
      API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}&units=metric`;
    }

    const response = await fetch(API_URL);
    const result = await response.json();

    if (result.cod !== "404") {
      // Display image content and temperature
      const imageContent = displayImageContent(result);
      iconsContainer.innerHTML = imageContent;
      iconsContainer.classList.add("fadeIn");

      // Display right side content
      const rightSide = rightSideContent(result);
      dayInfoEl.innerHTML = rightSide;

      // Fetch and display forecast
      await displayForecast(result.coord.lat, result.coord.lon);
    } else {
      // Display error message
      const errorMessage = `<h2 class="weather_temp">${result.cod}</h2>
                            <h3 class="cloudtxt">${result.message}</h3>`;
      iconsContainer.innerHTML = errorMessage;
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// Function to get current geolocation position
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

// Function to display image content and temperature
function displayImageContent(data) {
  return `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="">
          <h2 class="weather_temp">${Math.round(data.main.temp)}°C</h2>
          <h3 class="cloudtxt">${data.weather[0].description}</h3>`;
}

// Function to display the right side content
function rightSideContent(result) {
  return `<div class="content">
            <p class="title">NAME</p>
            <span class="value">${result.name}</span>
          </div>
          <div class="content">
            <p class="title">TEMP</p>
            <span class="value">${Math.round(result.main.temp)}°C</span>
          </div>
          <div class="content">
            <p class="title">HUMIDITY</p>
            <span class="value">${result.main.humidity}%</span>
          </div>
          <div class="content">
            <p class="title">WIND SPEED</p>
            <span class="value">${result.wind.speed} m/s</span>
          </div>`;
}

// Function to fetch and display forecast
async function displayForecast(lat, lon) {
  try {
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(forecastURL);
    const result = await response.json();

    if (result.cod !== "404") {
      const forecastDays = result.list.filter((forecast, index) => index % 8 === 0).slice(0, 5);

      // Generate forecast list items
      const forecastItems = forecastDays.map(forecast => {
        const dayOfWeek = days[new Date(forecast.dt_txt).getDay()];
        return `<li>
                  <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" />
                  <span>${dayOfWeek.substr(0, 3)}</span>
                  <span class="day_temp">${Math.round(forecast.main.temp)}°C</span>
                </li>`;
      });

      listContentEl.innerHTML = forecastItems.join("");
    } else {
      console.error("Forecast data not available.");
    }
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

// Automatically find and display weather for user's location on page load
document.addEventListener("DOMContentLoaded", () => {
  findLocation(); // Calls findLocation without a specific location, so it tries to use geolocation
});
