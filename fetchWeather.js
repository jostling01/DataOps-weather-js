import fs from 'fs' // lets our code to read files
import path from 'path' // handles file paths
import dotenv from 'dotenv' // lets our code read environment files

dotenv.config()

const DATA_DIR = path.join(import.meta.dirname, 'data')  // creates path to folder named data, which contains json and csv file
if (!fs.existsSync(DATA_DIR)) { // checks if DATA_DIR exists, if it doesn' exist, use mkdirSync to create a directory called DATA_DIR
    fs.mkdirSync(DATA_DIR)
}

const WEATHER_FILE = path.join(DATA_DIR, 'weather.json') // take DATA_DIR and join weather.json into it
const LOG_FILE = path.join(DATA_DIR, 'weather_log.csv') // take DATA_DIR and join weather_log.csv into it

export async function fetchWeather() {
    const apiKey = process.env.WEATHER_API_KEY
    const city = process.env.CITY || 'London'
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json() // converts response from json into js object
        const nowUTC = new Date().toISOString() // toISOString returns a string in ISO format
        data._last_updated_utc = nowUTC
        fs.writeFileSync(WEATHER_FILE, JSON.stringify(data, null, 2)) // JSON.stringify converts js object to json object
        
        const header = 'timestamp,city,temperature,description\n' // - \n makes a new line
        if (!fs.existsSync(LOG_FILE)) {
            fs.writeFileSync(LOG_FILE, header)
        } else {
            const firstLine = fs.readFileSync(LOG_FILE, 'utf8').split('\n')[0] // utf8 used for reading characters, 
            if (firstLine !== 'timestamp,city,temperature,description') {
                fs.writeFileSync(LOG_FILE, header + fs.readFileSync(LOG_FILE, 'utf8'))
            }
        }

        const logEntry = `${nowUTC}, ${city}, ${data.main.temp}, ${data.weather[0].description}\n`
        fs.appendFileSync(LOG_FILE, logEntry)

        console.log(`Weather data updated for ${city} at ${nowUTC}`);
    } catch(err) {
        console.log('Error fetching weather:', err);
    }

}


if (import.meta.url === `file://${process.argv[1]}`) { // checking where the current file is running from
}
fetchWeather()