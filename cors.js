/**
 * GyaniYadu - CORS Proxy Helper
 * 
 * This file contains functions to help deal with CORS issues when making API requests.
 * If you're experiencing CORS errors when fetching news or weather information for India,
 * you can modify the script.js file to use these helper functions.
 */

// List of CORS proxy servers
const CORS_PROXIES = [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/'
];

// Default proxy index
let currentProxyIndex = 0;

/**
 * Wraps a URL with a CORS proxy
 * @param {string} url - The original URL to fetch
 * @returns {string} - The URL wrapped with a CORS proxy
 */
function corsProxy(url) {
    return `${CORS_PROXIES[currentProxyIndex]}${encodeURIComponent(url)}`;
}

/**
 * Fetch with CORS proxy and fallback to other proxies if needed
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch response
 */
async function fetchWithCorsProxy(url, options = {}) {
    // Try without proxy first
    try {
        return await fetch(url, options);
    } catch (error) {
        console.log('Direct fetch failed, trying with CORS proxy...');
    }
    
    // Try with each proxy
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        currentProxyIndex = i;
        try {
            const proxiedUrl = corsProxy(url);
            const response = await fetch(proxiedUrl, options);
            if (response.ok) {
                console.log(`CORS proxy successful using: ${CORS_PROXIES[i]}`);
                return response;
            }
        } catch (error) {
            console.log(`CORS proxy ${CORS_PROXIES[i]} failed, trying next...`);
        }
    }
    
    // If all proxies fail, throw error
    throw new Error('All CORS proxies failed. Please try running the site on a local server.');
}

/**
 * How to use in script.js:
 * 
 * To handle CORS for India-specific news APIs and weather data:
 * 
 * 1. First ensure this file is properly imported in index.html:
 *    <script src="cors.js"></script>
 * 
 * 2. Then modify the fetch calls in script.js:
 *    
 *    Instead of:
 *    const response = await fetch(url);
 * 
 *    Use:
 *    const response = await fetchWithCorsProxy(url);
 * 
 * 3. Apply this to all API calls (NewsAPI, Guardian, NewsData.io, OpenWeatherMap)
 *    
 * Note: For even better performance in India, consider setting up a dedicated 
 * CORS proxy server in an Indian data center.
 */ 