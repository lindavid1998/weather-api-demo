import { useMetric } from './index'

function convertKelvin(deg) {
    if (useMetric) {
        return `${Math.round(deg - 273)}&#8451`; // to C
    } else {
        return `${Math.round((deg - 273.15) * 9/5 + 32)}&#8457` // to F
    }
}

function convertWindDegToDirection(deg) {
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
    // input: Date object
    // output: String -> time of Date object in HH:MM AM/PM format

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

export {
    convertKelvin,
    convertWindDegToDirection,
    convertDateToTime
}