const API_KEY = '96982c931916b45bc19ab916987f580b';
let useMetric = false;

window.onload = () => {
    loadPopularCities();
};

let convertUnitBtn = document.getElementById('convert-btn')
convertUnitBtn.addEventListener('click', () => {
    useMetric = !useMetric;
    if (useMetric) {
        convertUnitBtn.innerHTML = `Units: &#8451`
    } else {
        convertUnitBtn.innerHTML = `Units: &#8457`
    }

    loadPopularCities();
    loadSearchResult(document.querySelector('.city-name').textContent); 
})

let searchInput = document.getElementById('city')

document.getElementById('search-icon').addEventListener('click', () => {
    loadSearchResult(searchInput.value);
})

searchInput.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        loadSearchResult(searchInput.value)
    }
})

async function getWeather(city) {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`, {mode: 'cors'})
        let data = await response.json();
    } catch (error) {
        console.log(error);
    }
}

async function getForecast(city) {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${API_KEY}`, {mode: 'cors'})
        let data = await response.json();
        console.log(data)
    } catch (error) {
        console.log(error);
    }
}

async function loadPopularCities() {
    // appends weather summaries to sub header
    let cities = ['San Diego', 'London', 'Taipei', 'New York'];
    let output = [];
    for (let city of cities) {
        output.push(await createCard(city));
    }

    let popularCities = document.querySelector('.popular-cities');
    popularCities.replaceChildren(...output);  

    document.querySelectorAll('.popular-city').forEach(city => {
        city.addEventListener('click', (e) => {
            let city = e.currentTarget.querySelector('.name').textContent
            loadSearchResult(city)
        })
    })

}

async function createCard(city) {
    // input: city -> string
    // output: div
    // creates a div that summarizes the weather of input city

    try {
        let response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`,
            { mode: 'cors' }
        )

        let data = await response.json();
        let temp = convertKelvin(data.main.temp);
        let weather = data.weather[0];
        let time = new Date((data.dt + data.timezone) * 1000);

        let card = createDiv('popular-city');
        appendSummary(card, weather.id, temp, time);
        appendDescription(card, city, weather.main);

        return card 

    } catch (error) {
        console.log(error);
    }
}

function appendSummary(card, weatherID, temperature, time) {
    let summary = createDiv('weather-summary');
    let img = document.createElement('img');
    let span = document.createElement('span');

    loadWeatherIcon(img, weatherID, time);
    span.classList.add('temperature');
    span.innerHTML = temperature;
    summary.append(img, span);
    card.append(summary);
}

function appendDescription(card, city, weather) {
    let desc = createDiv('weather-description');
    let name = createDiv('name');
    let conditions = createDiv('conditions');

    name.textContent = city;
    conditions.textContent = weather;
    desc.append(name, conditions);
    card.append(desc);
}

function createDiv(className = '') {
    let div = document.createElement('div')
    div.classList.add(className)
    return div
}

function convertKelvin(deg) {
    if (useMetric) {
        return `${Math.round(deg - 273)}&#8451`; // C
    } else {
        return `${Math.round((deg - 273.15) * 9/5 + 32)}&#8457` // F
    }
}

function convertWindDegToDirection(deg) {
    // input: deg -> Number
    // output: string

    switch (true) {
        case (deg >= 30 && deg < 60):
            return 'NE'
        case (deg >= 60 && deg < 120):
            return 'E'
        case (deg >= 120 && deg < 150):
            return 'SE'
        case (deg >= 150 && deg < 210):
            return 'S'
        case (deg >= 210 && deg < 240):
            return 'SW'
        case (deg >= 240 && deg < 300):
            return 'W'
        case (deg >= 300 && deg < 330):
            return 'NW'
        default:
            return 'N'
    }
}

function convertDateToTime(time) {
    // time -> Date object
    // returns time of Date object in HH:MM AM/PM format

    let hours = time.getUTCHours();
    let minutes = '0' + time.getUTCMinutes();
    minutes = minutes.slice(-2);

    if (hours > 12) {
        hours = hours - 12;
        return `${hours}:${minutes} PM`
    } else {
        return `${hours}:${minutes} AM`
    }
    
}

function loadWeatherIcon(img, id, time) {
    // updates src and alt attributes of img based on weather and time
    // img -> img element
    // id -> id of weather condition 
    // time -> Date object

    const icons = {
        rain: 'cloud-rain',
        snow: 'cloud-snow',
        clouds: 'cloud'
    }

    let isNight = time.getUTCHours() > 17 && time.getUTCHours() < 24;
    let isEarlyMorning = time.getUTCHours() >= 0 && time.getUTCHours() < 6;
    if (isNight || isEarlyMorning) {
        icons.clear = 'moon-stars';
        icons.partlyClear = 'cloud-moon';
    } else {
        icons.clear = 'sun';
        icons.partlyClear = 'cloud-sun';
    }

    id = String(id);
    switch (true) {
        case (id == '800'):
            img.src = `./icons/${icons.clear}.svg`
            img.alt = 'Icon for clear conditions';
            break;
        case (id == '801'):
            img.src = `./icons/${icons.partlyClear}.svg`
            img.alt = 'Icon for partly clear conditions';
            break;
        case (id.startsWith('2') || id.startsWith('3') || id.startsWith('5')):
            img.src = `./icons/${icons.rain}.svg`
            img.alt = 'Icon for rainy conditions';
            break;
        case (id.startsWith('6')):
            img.src = `./icons/${icons.snow}.svg`
            img.alt = 'Icon for snowy conditions';
            break; 
        case (id.startsWith('80')):
            img.src = `./icons/${icons.clouds}.svg`
            img.alt = 'Icon for cloudy conditions';
            break;
        default:
            img.src = `./icons/other.svg`
            img.alt = 'Icon for atmospheric condition';
    }
}

async function loadSearchResult(city) {
    try {
        // fetch weather and forecast
        let weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`, {mode: 'cors'})
        let weatherData = await weatherResponse.json();
        let forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${API_KEY}`, {mode: 'cors'})
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
        showSearchResult()

        // load sections
        loadSectionOne(weatherData)
        loadSectionTwo(highLows)
        loadSectionThree(weatherData)
        load4DayForecast(forecast, timezone, highLows)

    } catch (error) {
        hideSearchResult()
        document.querySelector('.placeholder').textContent = 
            'No results. Please check that a valid location was entered.'
    }
}

function hideSearchResult() {
    document.querySelector('.placeholder').style.display = 'flex'
    document.querySelector('.current-weather').style.display = 'none';
    document.querySelector('.forecast').style.display = 'none';
}

function showSearchResult() {
    document.querySelector('.placeholder').style.display = 'none'
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
    feelsLike.innerHTML = `Feels Like: ${convertKelvin(data.main.feels_like)}`
}

function loadSectionTwo(highLows) {
    const section = document.querySelector('.section-two');
    const currentDate = Object.keys(highLows)[0];
    const high = section.querySelector('.high .value');
    const low = section.querySelector('.low .value');
    high.innerHTML = highLows[currentDate].high
    low.innerHTML = highLows[currentDate].low
}

function loadSectionThree(data) {
    // load wind
    const wind =  document.querySelector('#wind .value')
    let direction = convertWindDegToDirection(data.wind.deg);
    let speed;
    if (useMetric) {
        speed = `${data.wind.speed} m/s`;
    } else {
        speed = `${Math.round(2.237 * data.wind.speed)} mph`;
    }
    wind.innerHTML = `${speed}, ${direction}`
  
    // load humidity
    const humidity =  document.querySelector('#humidity .value');
    humidity.innerHTML = `${data.main.humidity}%`
    
    // load sunrise
    const sunriseDiv =  document.querySelector('#sunrise .value');
    let sunrise = new Date((data.sys.sunrise + data.timezone) * 1000);
    sunriseDiv.textContent = convertDateToTime(sunrise);

    // load sunset
    const sunsetDiv =  document.querySelector('#sunset .value');
    let sunset = new Date((data.sys.sunset + data.timezone) * 1000);
    sunsetDiv.textContent = convertDateToTime(sunset);
}

function load4DayForecast(forecast, timezone, highLows) {
    // get singular timepoint per day, starting from next day
    forecast = filterForecast(forecast, timezone);

    // populate DOM using a for loop from i = 0 to i = 4
    const days = document.querySelectorAll('.forecast .day');
    for (let i = 0; i < days.length; i++) {
        loadDayForecast(
            days[i],
            forecast[Object.keys(forecast)[i]],
            timezone,
            highLows[Object.keys(forecast)[i]]
        )
    }
}

function groupForecastByDay(data, timezone) {
    // return object where forecast (values) are separated by days (keys) 
    let output = {}
    let forecast = data.list;

    forecast.forEach(forecast => {
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

        let key = `${temp.month}/${temp.day}`
        if (!output[key]) {
            output[key] = []
        }

        output[key].push(forecast);
    })

    return output 
}

function filterForecast(input, timezone) {
    // filters grouped forecast such that only a single timepoint is paired to each day
    let output = {};
    let dates = Object.keys(input);
    dates.forEach(day => {
        let filtered = input[day].filter(timepoint => {
            let shiftedDt = new Date((timepoint.dt + timezone) * 1000);
            let day = shiftedDt.getUTCDate();
            let hour = shiftedDt.getUTCHours();
            let now = new Date(Date.now() + timezone * 1000);

            let isValid = (hour > 10) && (hour < 15) && (now.getUTCDate() != day);
            return isValid
        })

        if (filtered.length > 0) {
            output[day] = filtered[0]
        }
    })

    return output
}

function loadDayForecast(div, forecast, timezone, highLow) {
    // div -> HTML element to populate
    // forecast -> openweather forecast object
    // timezone -> timezone shift relative to UTC in seconds
    let date = new Date((forecast.dt + timezone) * 1000);

    // populate day of week
    const weekday = [
        'Sun',
        'Mon',
        'Tues',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
    ]
    
    const dayOfWeek = div.querySelector('.day-of-week');
    dayOfWeek.textContent = weekday[date.getUTCDay()];

    // populate date
    const dateDiv = div.querySelector('.date');
    let day = date.getUTCDate();
    let month = date.getUTCMonth() + 1;
    dateDiv.textContent = `${month}/${day}`

    // populate icon
    const img = div.querySelector('img');
    loadWeatherIcon(img, forecast.weather[0].id, date);

    // populate high low 
    const high = div.querySelector('.high')
    high.innerHTML = `<span>H: </span>${highLow.high}`
    const low = div.querySelector('.low')
    low.innerHTML = `<span>L: </span>${highLow.low}`

}

function getHighLowByDay(forecast) {
    // given object of forecast divided by day (keys), return object with high and lows (values) of each day (key)
    let output = {};
    for (const day in forecast) {
        let dayForecast = forecast[day] // array of objects
        
        let highs = dayForecast.map(timepoint => timepoint.main.temp_max)
        let lows = dayForecast.map(timepoint => timepoint.main.temp_min)

        output[day] = {
            'high': convertKelvin(Math.max(...highs)),
            'low': convertKelvin(Math.min(...lows))
        }
    }

    return output
}
