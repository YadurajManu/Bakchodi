/**
 * NewsWeather - Main JavaScript
 * 
 * Note on CORS issues:
 * If you encounter CORS errors when fetching from the APIs, try these solutions:
 * 1. Run the site on a local server (python -m http.server or npx serve)
 * 2. Use the included CORS proxy helper by modifying all fetch calls to use fetchWithCorsProxy()
 *    Example: change "const response = await fetch(url);" to "const response = await fetchWithCorsProxy(url);"
 * 3. Install a CORS browser extension
 */

// API Keys
const NEWS_API_KEY = "5e7bad98b99548c59ef093ed5ef77c70";
const GUARDIAN_API_KEY = "2772af90-c352-4a8d-ad2e-90e2f1061fa3";
const NEWSDATA_API_KEY = "pub_75826eef5f45466bc36645f999f1d07627ded";
const WEATHER_API_KEY = "7c0c5224a43461f08c7bd34ed0118e55";

// API Base URLs
const NEWS_API_BASE_URL = "https://newsapi.org/v2";
const GUARDIAN_BASE_URL = "https://content.guardianapis.com";
const NEWSDATA_BASE_URL = "https://newsdata.io/api/1";
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const categoryButtons = document.querySelectorAll('.category-btn');
const sourceSelect = document.getElementById('source-select');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const weatherIconElement = document.getElementById('weather-icon');

// Default Parameters
let currentCategory = 'general';
let currentSource = 'newsapi';
let currentSearchQuery = '';
let weatherCity = 'London'; // Default city

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Initial news fetch
    fetchNews();
    
    // Get user's location for weather
    getUserLocation();
    
    // Event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveCategory(button.dataset.category);
            fetchNews();
        });
    });
    
    sourceSelect.addEventListener('change', () => {
        currentSource = sourceSelect.value;
        fetchNews();
    });
});

// Set active category
function setActiveCategory(category) {
    currentCategory = category;
    categoryButtons.forEach(button => {
        if (button.dataset.category === category) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Handle search
function handleSearch() {
    currentSearchQuery = searchInput.value.trim();
    fetchNews();
}

// Fetch news based on current parameters
async function fetchNews() {
    // Show loading
    newsContainer.innerHTML = '<div class="loading">Loading news...</div>';
    
    try {
        let articles = [];
        
        if (currentSource === 'newsapi') {
            articles = await fetchNewsAPI();
        } else if (currentSource === 'guardian') {
            articles = await fetchGuardianAPI();
        } else if (currentSource === 'newsdata') {
            articles = await fetchNewsDataAPI();
        }
        
        displayNews(articles);
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContainer.innerHTML = `<div class="error">Error loading news. Please try again later.</div>`;
    }
}

// Fetch from NewsAPI
async function fetchNewsAPI() {
    let url = `${NEWS_API_BASE_URL}/top-headlines?apiKey=${NEWS_API_KEY}&category=${currentCategory}`;
    
    if (currentSearchQuery) {
        url = `${NEWS_API_BASE_URL}/everything?apiKey=${NEWS_API_KEY}&q=${currentSearchQuery}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'ok') {
        throw new Error(data.message || 'Failed to fetch from NewsAPI');
    }
    
    return data.articles.map(article => ({
        source: article.source.name || 'NewsAPI',
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        imageUrl: article.urlToImage || 'https://via.placeholder.com/300x200?text=No+Image',
        publishedAt: new Date(article.publishedAt).toLocaleDateString()
    }));
}

// Fetch from Guardian API
async function fetchGuardianAPI() {
    let url = `${GUARDIAN_BASE_URL}/search?api-key=${GUARDIAN_API_KEY}&section=${currentCategory === 'general' ? 'news' : currentCategory}`;
    
    if (currentSearchQuery) {
        url = `${GUARDIAN_BASE_URL}/search?api-key=${GUARDIAN_API_KEY}&q=${currentSearchQuery}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.response) {
        throw new Error('Failed to fetch from The Guardian API');
    }
    
    return data.response.results.map(article => ({
        source: 'The Guardian',
        title: article.webTitle,
        description: article.fields?.trailText || 'No description available',
        url: article.webUrl,
        imageUrl: article.fields?.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image',
        publishedAt: new Date(article.webPublicationDate).toLocaleDateString()
    }));
}

// Fetch from NewsData.io
async function fetchNewsDataAPI() {
    let url = `${NEWSDATA_BASE_URL}/news?apikey=${NEWSDATA_API_KEY}&category=${currentCategory}`;
    
    if (currentSearchQuery) {
        url = `${NEWSDATA_BASE_URL}/news?apikey=${NEWSDATA_API_KEY}&q=${currentSearchQuery}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to fetch from NewsData.io');
    }
    
    return data.results.map(article => ({
        source: article.source_id || 'NewsData.io',
        title: article.title,
        description: article.description || 'No description available',
        url: article.link,
        imageUrl: article.image_url || 'https://via.placeholder.com/300x200?text=No+Image',
        publishedAt: new Date(article.pubDate).toLocaleDateString()
    }));
}

// Display news articles
function displayNews(articles) {
    if (articles.length === 0) {
        newsContainer.innerHTML = '<div class="no-results">No articles found. Try a different search or category.</div>';
        return;
    }
    
    newsContainer.innerHTML = articles.map(article => `
        <div class="news-card">
            <img class="news-image" src="${article.imageUrl}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="news-content">
                <span class="news-source">${article.source} • ${article.publishedAt}</span>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description}</p>
                <a href="${article.url}" class="news-link" target="_blank">Read more</a>
            </div>
        </div>
    `).join('');
}

// Get user's location for weather
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            error => {
                console.error('Error getting location:', error);
                fetchWeatherByCity(weatherCity);
            }
        );
    } else {
        fetchWeatherByCity(weatherCity);
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        const url = `${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === 200) {
            displayWeather(data);
        } else {
            throw new Error(data.message || 'Failed to fetch weather');
        }
    } catch (error) {
        console.error('Error fetching weather:', error);
        locationElement.textContent = 'Weather unavailable';
    }
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
    try {
        const url = `${WEATHER_API_BASE_URL}/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === 200) {
            displayWeather(data);
        } else {
            throw new Error(data.message || 'Failed to fetch weather');
        }
    } catch (error) {
        console.error('Error fetching weather:', error);
        locationElement.textContent = 'Weather unavailable';
    }
}

// Display weather information
function displayWeather(data) {
    locationElement.textContent = data.name;
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    
    const iconCode = data.weather[0].icon;
    weatherIconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIconElement.alt = data.weather[0].description;
} 