/**
 * GyaniYadu - India's Minimalist News & Weather Portal
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
const featuredNewsContainer = document.getElementById('featured-news');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const categoryButtons = document.querySelectorAll('.category-btn');
const sourceSelect = document.getElementById('source-select');
const indiaOnlyCheckbox = document.getElementById('india-only');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const weatherIconElement = document.getElementById('weather-icon');
const modal = document.getElementById('info-modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.querySelector('.close-modal');
const aboutLink = document.getElementById('about-link');
const privacyLink = document.getElementById('privacy-link');
const contactLink = document.getElementById('contact-link');

// Default Parameters
let currentCategory = 'general';
let currentSource = 'newsapi';
let currentSearchQuery = '';
let indiaNewsOnly = true;
let weatherCity = 'New Delhi'; // Default city for India
let featuredArticles = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Add console log to help debug
    console.log('GyaniYadu initializing...');
    
    // Initial news fetch
    fetchNews();
    
    // Get user's location for weather, defaulting to India if not available
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
    
    indiaOnlyCheckbox.addEventListener('change', () => {
        indiaNewsOnly = indiaOnlyCheckbox.checked;
        fetchNews();
    });
    
    // Modal event listeners
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('about');
    });
    
    privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('privacy');
    });
    
    contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('contact');
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

// Show modal content
function showModal(type) {
    let content = '';
    
    if (type === 'about') {
        content = `
            <h2>About GyaniYadu</h2>
            <p>GyaniYadu is a minimalist news and weather portal focused on delivering the latest news from India and around the world.</p>
            <p>Our mission is to provide a clean, distraction-free reading experience while keeping you informed about current events and weather conditions.</p>
            <p>The name "GyaniYadu" combines "Gyani" (knowledgeable) with "Yadu" (information), representing our goal to deliver knowledge and information in a simple format.</p>
            <h3>Our Sources</h3>
            <p>We aggregate news from multiple trusted sources including NewsAPI, The Guardian, and NewsData.io to give you a comprehensive view of what's happening in India and globally.</p>
        `;
    } else if (type === 'privacy') {
        content = `
            <h2>Privacy Policy</h2>
            <p>GyaniYadu respects your privacy and is committed to protecting your personal data.</p>
            <h3>Data Collection</h3>
            <p>We collect your location data only to provide you with relevant weather information. This data is not stored or shared with third parties.</p>
            <h3>Cookies</h3>
            <p>GyaniYadu does not use cookies to track your browsing behavior.</p>
            <h3>Third-Party Services</h3>
            <p>We use third-party APIs for news and weather data. Please refer to their respective privacy policies for information on how they handle data.</p>
        `;
    } else if (type === 'contact') {
        content = `
            <h2>Contact Us</h2>
            <p>We'd love to hear from you! You can reach us through the following channels:</p>
            <ul style="list-style: none; padding: 0;">
                <li><strong>Email:</strong> contact@gyaniyadu.com</li>
                <li><strong>Phone:</strong> +91 9876543210</li>
                <li><strong>Address:</strong> 123 Digital Street, Tech Hub, Bangalore - 560001, India</li>
            </ul>
            <p>For feedback, suggestions, or technical support, please email us at support@gyaniyadu.com</p>
        `;
    }
    
    modalContent.innerHTML = content;
    modal.style.display = 'block';
}

// Attempt to fetch news from multiple sources if primary source fails
async function attemptMultipleSources() {
    const sources = ['newsapi', 'newsdata', 'guardian'];
    let articles = [];
    let errors = [];
    
    // Try each source until we get articles
    for (const source of sources) {
        try {
            console.log(`Attempting to fetch from ${source}...`);
            
            if (source === 'newsapi') {
                articles = await fetchNewsAPI();
            } else if (source === 'guardian') {
                articles = await fetchGuardianAPI();
            } else if (source === 'newsdata') {
                articles = await fetchNewsDataAPI();
            }
            
            if (articles.length > 0) {
                console.log(`Successfully fetched ${articles.length} articles from ${source}`);
                return articles;
            }
        } catch (error) {
            console.error(`Error fetching from ${source}:`, error);
            errors.push(`${source}: ${error.message}`);
        }
    }
    
    // If we get here, all sources failed
    throw new Error(`All news sources failed: ${errors.join(', ')}`);
}

// Fetch news based on current parameters
async function fetchNews() {
    // Show loading
    newsContainer.innerHTML = '<div class="loading">Loading news...</div>';
    featuredNewsContainer.innerHTML = '';
    
    try {
        let articles = [];
        
        try {
            // First try the selected source
            if (currentSource === 'newsapi') {
                articles = await fetchNewsAPI();
            } else if (currentSource === 'guardian') {
                articles = await fetchGuardianAPI();
            } else if (currentSource === 'newsdata') {
                articles = await fetchNewsDataAPI();
            }
        } catch (error) {
            console.error(`Error with primary source ${currentSource}:`, error);
            
            // Check if it's likely a CORS issue
            if (error.message.includes('CORS') || error.message.includes('blocked') || error.message.includes('Origin')) {
                const corsMessage = `
                    <div class="error">
                        <h3>CORS Error Detected</h3>
                        <p>We're having trouble accessing news data due to Cross-Origin Resource Sharing (CORS) restrictions.</p>
                        <p>To fix this issue:</p>
                        <ol>
                            <li>Run this website on a local server (see README.md)</li>
                            <li>Install a CORS browser extension</li>
                            <li>Try a different news source</li>
                        </ol>
                    </div>
                `;
                newsContainer.innerHTML = corsMessage;
                featuredNewsContainer.innerHTML = '';
                return;
            }
            
            // If the selected source fails, try all sources
            articles = await attemptMultipleSources();
        }
        
        // Filter for India news if the checkbox is checked
        if (indiaNewsOnly) {
            const filteredArticles = filterIndiaNews(articles);
            
            // Only use filtered if we got results, otherwise fall back to all articles
            if (filteredArticles.length > 0) {
                articles = filteredArticles;
            } else {
                console.log('No India-specific news found, showing all news');
            }
        }
        
        // If still no articles, show error
        if (articles.length === 0) {
            throw new Error('No articles found. Try different search criteria or news source.');
        }
        
        // Get featured articles
        featuredArticles = selectFeaturedArticles(articles);
        
        // Remove featured articles from main list
        const featuredIds = featuredArticles.map(article => article.url);
        const mainArticles = articles.filter(article => !featuredIds.includes(article.url));
        
        displayFeaturedNews(featuredArticles);
        displayNews(mainArticles);
    } catch (error) {
        console.error('Error fetching news:', error);
        
        // Provide more detailed error messages for common problems
        let errorMessage = error.message;
        
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('api key')) {
            errorMessage = 'API key error. The news service API key may be invalid or have reached its limit.';
        } else if (error.message.includes('429')) {
            errorMessage = 'Too many requests. The news API rate limit has been reached. Try again later.';
        }
        
        newsContainer.innerHTML = `
            <div class="error">
                <h3>Error Loading News</h3>
                <p>${errorMessage}</p>
                <p>Suggestions:</p>
                <ul>
                    <li>Try a different news source</li>
                    <li>Check your internet connection</li>
                    <li>Reload the page</li>
                    <li>Try disabling "India News Only" if it's currently enabled</li>
                </ul>
            </div>
        `;
        featuredNewsContainer.innerHTML = '';
    }
}

// Filter for India-related news
function filterIndiaNews(articles) {
    const indiaKeywords = ['india', 'indian', 'delhi', 'mumbai', 'bangalore', 'kolkata', 'chennai', 'hyderabad', 
                          'ahmedabad', 'pune', 'modi', 'bjp', 'congress', 'maharashtra', 'uttar pradesh', 
                          'gujarat', 'tamil nadu', 'karnataka', 'kerala'];
    
    return articles.filter(article => {
        const title = article.title.toLowerCase();
        const description = article.description.toLowerCase();
        
        return indiaKeywords.some(keyword => 
            title.includes(keyword) || description.includes(keyword)
        );
    }).map(article => {
        // Add isIndiaNews flag
        return {
            ...article,
            isIndiaNews: true
        };
    });
}

// Select featured articles
function selectFeaturedArticles(articles) {
    if (articles.length < 2) return [];
    
    // Prioritize articles with images
    const articlesWithImages = articles.filter(article => 
        article.imageUrl && !article.imageUrl.includes('placeholder')
    );
    
    if (articlesWithImages.length >= 2) {
        return articlesWithImages.slice(0, 2);
    } else {
        return articles.slice(0, 2);
    }
}

// Fetch from NewsAPI
async function fetchNewsAPI() {
    let url = `${NEWS_API_BASE_URL}/top-headlines?apiKey=${NEWS_API_KEY}&category=${currentCategory}`;
    
    // Add country=in parameter if India-only is checked
    if (indiaNewsOnly) {
        url += '&country=in';
    }
    
    if (currentSearchQuery) {
        // Properly encode search query
        const encodedQuery = encodeURIComponent(currentSearchQuery);
        url = `${NEWS_API_BASE_URL}/everything?apiKey=${NEWS_API_KEY}&q=${encodedQuery}`;
        
        // Add India to search query if India-only is checked
        if (indiaNewsOnly) {
            url += `%20AND%20${encodeURIComponent('India')}`;
        }
    }
    
    const response = await fetchWithCorsProxy(url);
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
        publishedAt: new Date(article.publishedAt).toLocaleDateString(),
        isIndiaNews: article.source.name?.toLowerCase().includes('india') || false
    }));
}

// Fetch from Guardian API
async function fetchGuardianAPI() {
    let url = `${GUARDIAN_BASE_URL}/search?api-key=${GUARDIAN_API_KEY}`;
    
    if (currentCategory !== 'general') {
        url += `&section=${encodeURIComponent(currentCategory)}`;
    }
    
    if (indiaNewsOnly) {
        url += `&q=${encodeURIComponent('India')}`;
    }
    
    if (currentSearchQuery) {
        // Properly encode search query
        const encodedQuery = encodeURIComponent(currentSearchQuery);
        url = `${GUARDIAN_BASE_URL}/search?api-key=${GUARDIAN_API_KEY}&q=${encodedQuery}`;
        
        // Add India to search query if India-only is checked
        if (indiaNewsOnly) {
            url += `+${encodeURIComponent('India')}`;
        }
    }
    
    const response = await fetchWithCorsProxy(url);
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
        publishedAt: new Date(article.webPublicationDate).toLocaleDateString(),
        isIndiaNews: article.sectionName?.toLowerCase().includes('india') || false
    }));
}

// Fetch from NewsData.io
async function fetchNewsDataAPI() {
    let url = `${NEWSDATA_BASE_URL}/news?apikey=${NEWSDATA_API_KEY}&category=${currentCategory}`;
    
    if (indiaNewsOnly) {
        url += '&country=in';
    }
    
    if (currentSearchQuery) {
        // Properly encode search query
        const encodedQuery = encodeURIComponent(currentSearchQuery);
        url = `${NEWSDATA_BASE_URL}/news?apikey=${NEWSDATA_API_KEY}&q=${encodedQuery}`;
        
        // Add India to search query if India-only is checked
        if (indiaNewsOnly) {
            url += `+${encodeURIComponent('India')}`;
        }
    }
    
    const response = await fetchWithCorsProxy(url);
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
        publishedAt: new Date(article.pubDate).toLocaleDateString(),
        isIndiaNews: article.country?.includes('india') || false
    }));
}

// Display featured news
function displayFeaturedNews(articles) {
    if (articles.length === 0) {
        featuredNewsContainer.style.display = 'none';
        return;
    }
    
    featuredNewsContainer.style.display = 'grid';
    
    featuredNewsContainer.innerHTML = articles.map(article => `
        <div class="featured-card" style="background-image: url('${article.imageUrl}')">
            <div class="featured-content">
                <span class="featured-source">${article.source}</span>
                <h2 class="featured-title">${article.title}</h2>
                <p class="featured-description">${article.description.substring(0, 100)}${article.description.length > 100 ? '...' : ''}</p>
                <a href="${article.url}" class="featured-link" target="_blank">Read more</a>
            </div>
        </div>
    `).join('');
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
                <div>
                    <span class="news-source">${article.source} • ${article.publishedAt}</span>
                    ${article.isIndiaNews ? '<span class="news-india-tag">India</span>' : ''}
                </div>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description.substring(0, 120)}${article.description.length > 120 ? '...' : ''}</p>
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
        const response = await fetchWithCorsProxy(url);
        const data = await response.json();
        
        if (data.cod === 200) {
            displayWeather(data);
        } else {
            throw new Error(data.message || 'Failed to fetch weather');
        }
    } catch (error) {
        console.error('Error fetching weather:', error);
        locationElement.textContent = 'Weather unavailable';
        
        // Fallback to default city for India
        fetchWeatherByCity(weatherCity);
    }
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
    try {
        const url = `${WEATHER_API_BASE_URL}/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`;
        const response = await fetchWithCorsProxy(url);
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