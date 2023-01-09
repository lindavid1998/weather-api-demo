const API_KEY = '96982c931916b45bc19ab916987f580b';
let useCelsius = false;

window.onload = () => {
    loadPopularCities();
};

let convertUnitBtn = document.getElementById('convert-btn')
convertUnitBtn.addEventListener('click', () => {
    useCelsius = !useCelsius;
    if (useCelsius) {
        convertUnitBtn.innerHTML = `Units: &#8451`
    } else {
        convertUnitBtn.innerHTML = `Units: &#8457`
    }
    loadPopularCities();
})

async function showWeather(city) {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`, {mode: 'cors'})
        let data = await response.json();
        // console.log(data)
    } catch (err) {
        console.log(err);
    }
}

async function getForecast(city) {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${API_KEY}`, {mode: 'cors'})
        let data = await response.json();
        console.log(data)
    } catch (err) {
        console.log(err);
    }
}

async function loadPopularCities() {
    // input: none
    // output: none
    // appends weather summaries to sub header

    let cities = ['San Diego', 'London', 'Taipei', 'New York'];

    let output = [];
    for (let city of cities) {
        output.push(await createCard(city));
    }

    let popularCities = document.querySelector('.popular-cities');
    popularCities.replaceChildren(...output);  
}

async function createCard(city) {
    // input: city -> string
    // output: div
    // creates a div that summarizes the weather of input city

    try {
        // fetch data
        let response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`,
            { mode: 'cors' }
        )
        let data = await response.json();

        let temp = convertKelvin(data.main.temp);
        let weather = data.weather[0];
        let time = new Date((data.dt + data.timezone) * 1000);

        let card = createDiv('popular-city')
        appendSummary(card, weather.id, temp, time);
        appendDescription(card, city, weather.main);

        return card 

    } catch (err) {
        console.log(err);
    }
}

function appendSummary(card, weatherID, temperature, time) {
    let summary = createDiv('weather-summary');
    let img = document.createElement('img');
    let span = document.createElement('span');

    updateImgAttributes(img, weatherID, time);
    span.classList.add('temperature');
    span.innerHTML = temperature;
    summary.append(img, span);
    
    card.append(summary)
}

function appendDescription(card, city, weather) {
    let desc = createDiv('weather-description');
    let name = createDiv('name');
    let conditions = createDiv('conditions')

    name.textContent = city;
    conditions.textContent = weather;
    desc.append(name, conditions);
    
    card.append(desc)
}

function createDiv(className = '') {
    let div = document.createElement('div')
    div.classList.add(className)
    return div
}

function convertKelvin(deg) {
    if (useCelsius) {
        return `${Math.round(deg - 273)} &#8451`;
    } else {
        return `${Math.round(deg - 273.15) * 9/5 + 32} &#8457`
    }
}

function updateImgAttributes(img, id, time) {
    // updates src and alt attributes of img based on weather and time

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
            img.src = `./SVG/${icons.clear}.svg`
            img.alt = 'Icon for clear conditions';
            break;
        case (id == '801'):
            img.src = `./SVG/${icons.partlyClear}.svg`
            img.alt = 'Icon for partly clear conditions';
            break;
        case (id.startsWith('2') || id.startsWith('3') || id.startsWith('5')):
            img.src = `./SVG/${icons.rain}.svg`
            img.alt = 'Icon for rainy conditions';
            break;
        case (id.startsWith('6')):
            img.src = `./SVG/${icons.snow}.svg`
            img.alt = 'Icon for snowy conditions';
            break; 
        case (id.startsWith('80')):
            img.src = `./SVG/${icons.clouds}.svg`
            img.alt = 'Icon for cloudy conditions';
            break;
        default:
            img.style.display = 'none'
            img.alt = 'Missing icon';
    }
}