const API_KEY = '96982c931916b45bc19ab916987f580b';

async function showWeather(city) {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`, {mode: 'cors'})
        let data = await response.json();
        console.log(data)
        // console.log(data.main);
        // p.textContent = `Current temperature: ${data.main.temp - 273} C`;
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