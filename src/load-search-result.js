import {
  convertKelvin,
  convertWindDegToDirection,
  convertDateToTime,
} from './conversions';
import { loadWeatherIcon } from './load-subheader';
import { API_KEY, useMetric } from './index';

async function loadSearchResult(city) {
  try {
    // fetch weather and forecast
    let weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`,
      { mode: 'cors' }
    );
    let weatherData = await weatherResponse.json();
    let forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${API_KEY}`,
      { mode: 'cors' }
    );
    let forecastData = await forecastResponse.json();

    let timezone = forecastData.city.timezone;
    let forecast = groupForecastByDay(forecastData, timezone);
    let highLows = getHighLowByDay(forecast);

    // populate city name and country
    const cityName = document.querySelector('.location .city-name');
    const country = document.querySelector('.location .country');
    cityName.textContent = weatherData.name;
    country.textContent = weatherData.sys.country;

    // toggle search result view
    showSearchResult();

    // load sections
    loadSectionOne(weatherData);
    loadSectionTwo(highLows);
    loadSectionThree(weatherData);
    load4DayForecast(forecast, timezone, highLows);
  } catch (error) {
    hideSearchResult();
    document.querySelector('.placeholder').textContent =
      'No results. Please check that a valid location was entered.';
  }
}

function hideSearchResult() {
  document.querySelector('.placeholder').style.display = 'flex';
  document.querySelector('.current-weather').style.display = 'none';
  document.querySelector('.forecast').style.display = 'none';
}

function showSearchResult() {
  document.querySelector('.placeholder').style.display = 'none';
  document.querySelector('.current-weather').style.display = 'flex';
  document.querySelector('.forecast').style.display = 'flex';
}

function loadSectionOne(data) {
  const section = document.querySelector('.section-one');

  // load icon
  const img = section.querySelector('.weather-icon img');
  let time = new Date((data.dt + data.timezone) * 1000);
  let weather = data.weather[0];
  loadWeatherIcon(img, weather.id, time);

  // load temperature
  const temp = section.querySelector('.temperature');
  temp.innerHTML = convertKelvin(data.main.temp);

  // load weather
  const weatherDiv = section.querySelector('.weather');
  weatherDiv.textContent = data.weather[0].main;

  // load feels like
  const feelsLike = section.querySelector('.feels-like');
  feelsLike.innerHTML = `Feels Like: ${convertKelvin(data.main.feels_like)}`;
}

function loadSectionTwo(highLows) {
  const section = document.querySelector('.section-two');
  const currentDate = Object.keys(highLows)[0];
  const high = section.querySelector('.high .value');
  const low = section.querySelector('.low .value');
  high.innerHTML = highLows[currentDate].high;
  low.innerHTML = highLows[currentDate].low;
}

function loadSectionThree(data) {
  const wind = document.querySelector('#wind .value');
  let direction = convertWindDegToDirection(data.wind.deg);
  let speed;
  if (useMetric) {
    speed = `${data.wind.speed} m/s`;
  } else {
    speed = `${Math.round(2.237 * data.wind.speed)} mph`;
  }
  wind.innerHTML = `${speed}, ${direction}`;

  const humidity = document.querySelector('#humidity .value');
  humidity.innerHTML = `${data.main.humidity}%`;

  const sunriseDiv = document.querySelector('#sunrise .value');
  const sunsetDiv = document.querySelector('#sunset .value');
  let sunrise = new Date((data.sys.sunrise + data.timezone) * 1000);
  let sunset = new Date((data.sys.sunset + data.timezone) * 1000);
  sunriseDiv.textContent = convertDateToTime(sunrise);
  sunsetDiv.textContent = convertDateToTime(sunset);
}

function load4DayForecast(forecast, timezone, highLows) {
  forecast = filterForecast(forecast, timezone);

  const days = document.querySelectorAll('.forecast .day');
  for (let i = 0; i < days.length; i++) {
    loadDayForecast(
      days[i],
      forecast[Object.keys(forecast)[i]],
      timezone,
      highLows[Object.keys(forecast)[i]]
    );
  }
}

function groupForecastByDay(data, timezone) {
  // return object where forecast (values) are separated by days (keys)
  let output = {};
  let forecast = data.list;

  forecast.forEach((forecast) => {
    // get day and month of forecasted date
    let shiftedDt = (forecast.dt + timezone) * 1000;
    let day = new Date(shiftedDt).getUTCDate();
    let month = new Date(shiftedDt).getUTCMonth() + 1;

    let temp = {};
    // if temp undefined or forecasted day is ahead of temp
    if (temp || temp.day < day || temp.month > month) {
      // overwrite temp
      temp.month = month;
      temp.day = day;
    }

    let key = `${temp.month}/${temp.day}`;
    if (!output[key]) {
      output[key] = [];
    }

    output[key].push(forecast);
  });

  return output;
}

function filterForecast(input, timezone) {
  // filters grouped-by-day forecast such that only a single timepoint is paired to each day
  let output = {};
  let dates = Object.keys(input);
  dates.forEach((day) => {
    let filtered = input[day].filter((timepoint) => {
      let shiftedDt = new Date((timepoint.dt + timezone) * 1000);
      let day = shiftedDt.getUTCDate();
      let hour = shiftedDt.getUTCHours();
      let now = new Date(Date.now() + timezone * 1000);

      let isValid = hour > 10 && hour < 15 && now.getUTCDate() != day;
      return isValid;
    });

    if (filtered.length > 0) {
      output[day] = filtered[0];
    }
  });

  return output;
}

function loadDayForecast(div, forecast, timezone, highLow) {
  // div -> HTML element to populate
  // forecast -> openweather forecast object
  // timezone -> timezone shift relative to UTC in seconds
  let date = new Date((forecast.dt + timezone) * 1000);

  // populate day of week
  const weekday = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dayOfWeek = div.querySelector('.day-of-week');
  dayOfWeek.textContent = weekday[date.getUTCDay()];

  // populate date
  const dateDiv = div.querySelector('.date');
  let day = date.getUTCDate();
  let month = date.getUTCMonth() + 1;
  dateDiv.textContent = `${month}/${day}`;

  // populate icon
  const img = div.querySelector('img');
  loadWeatherIcon(img, forecast.weather[0].id, date);

  // populate high low
  const high = div.querySelector('.high');
  const low = div.querySelector('.low');
  high.innerHTML = `<span>H: </span>${highLow.high}`;
  low.innerHTML = `<span>L: </span>${highLow.low}`;
}

function getHighLowByDay(forecast) {
  // given object of forecast divided by day (keys), return object with high and lows (values) of each day (key)
  let output = {};
  for (const day in forecast) {
    let dayForecast = forecast[day]; // array of objects

    let highs = dayForecast.map((timepoint) => timepoint.main.temp_max);
    let lows = dayForecast.map((timepoint) => timepoint.main.temp_min);

    output[day] = {
      high: convertKelvin(Math.max(...highs)),
      low: convertKelvin(Math.min(...lows)),
    };
  }

  return output;
}

export { loadSearchResult };
