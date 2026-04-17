// Weather widget functionality
function getWeatherEmoji(weatherCode) {
    const weatherEmojis = {
        0: '☀️', // Clear sky
        1: '🌤️', // Mainly clear
        2: '⛅', // Partly cloudy
        3: '☁️', // Overcast
        45: '🌫️', // Fog
        48: '🌫️', // Depositing rime fog
        51: '🌦️', // Light drizzle
        53: '🌦️', // Moderate drizzle
        55: '🌦️', // Dense drizzle
        56: '🌨️', // Light freezing drizzle
        57: '🌨️', // Dense freezing drizzle
        61: '🌧️', // Slight rain
        63: '🌧️', // Moderate rain
        65: '🌧️', // Heavy rain
        66: '🌨️', // Light freezing rain
        67: '🌨️', // Heavy freezing rain
        71: '❄️', // Slight snow fall
        73: '❄️', // Moderate snow fall
        75: '❄️', // Heavy snow fall
        77: '❄️', // Snow grains
        80: '🌦️', // Slight rain showers
        81: '🌦️', // Moderate rain showers
        82: '🌦️', // Violent rain showers
        85: '🌨️', // Slight snow showers
        86: '🌨️', // Heavy snow showers
        95: '⛈️', // Thunderstorm
        96: '⛈️', // Thunderstorm with slight hail
        99: '⛈️'  // Thunderstorm with heavy hail
    };
    return weatherEmojis[weatherCode] || '🌤️';
}

function isRainyWeather(weatherCode) {
    // Weather codes for rain: 51-67 (drizzle/rain), 80-82 (rain showers)
    return (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
}

async function getWeather(lat, lon) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`);
        const data = await response.json();
        
        const temp = Math.round(data.current_weather.temperature);
        const weatherCode = data.current_weather.weathercode;
        const emoji = getWeatherEmoji(weatherCode);
        const dailyData = data.daily;
        
        return { temp, emoji, dailyData };
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
}

function getDayName(dateString) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateString);
    return days[date.getDay()];
}

function renderForecast(dailyData) {
    const forecastContent = document.getElementById('forecast-content');
    const forecastDays = document.createElement('div');
    forecastDays.className = 'forecast-days';
    
    // Show next 5 days (skip today, start from tomorrow)
    for (let i = 1; i <= 5; i++) {
        const dayData = dailyData;
        const date = dayData.time[i];
        const weatherCode = dayData.weathercode[i];
        const emoji = getWeatherEmoji(weatherCode);
        const maxTemp = Math.round(dayData.temperature_2m_max[i]);
        const minTemp = Math.round(dayData.temperature_2m_min[i]);
        const isRainy = isRainyWeather(weatherCode);
        
        const dayCard = document.createElement('div');
        dayCard.className = `forecast-day ${isRainy ? 'rainy' : ''}`;
        dayCard.innerHTML = `
            <span class="forecast-day-name">${getDayName(date)}</span>
            <span class="forecast-day-emoji">${emoji}</span>
            <span class="forecast-day-temp">${maxTemp}°</span>
        `;
        forecastDays.appendChild(dayCard);
    }
    
    forecastContent.appendChild(forecastDays);
}

async function updateWeather() {
    const weatherContent = document.getElementById('weather-content');
    const forecastContent = document.getElementById('forecast-content');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            const weather = await getWeather(latitude, longitude);
            
            if (weather) {
                weatherContent.innerHTML = `
                    <div class="weather-info">
                        <span class="weather-emoji">${weather.emoji}</span>
                        <span class="weather-temp">${weather.temp}°F</span>
                    </div>
                    <div class="weather-location">Your location</div>
                `;
                forecastContent.innerHTML = '';
                renderForecast(weather.dailyData);
            } else {
                weatherContent.innerHTML = '<div class="weather-error">Unable to load weather data</div>';
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            weatherContent.innerHTML = '<div class="weather-error">Enable location to see your weather 🌤️</div>';
        });
    } else {
        weatherContent.innerHTML = '<div class="weather-error">Geolocation is not supported by this browser.</div>';
    }
}

// Load weather when page loads
document.addEventListener('DOMContentLoaded', updateWeather);
