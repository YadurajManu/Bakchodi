# GyaniYadu - India's Minimalist News & Weather Portal

A minimalistic, black and white news website with integrated weather functionality, focused on delivering news from India and around the world. This project uses multiple news sources and OpenWeatherMap API to provide a comprehensive news browsing experience.

## Features

- Clean, minimalistic black and white design with Indian flag accent colors
- News from multiple sources:
  - NewsAPI (with India focus)
  - The Guardian
  - NewsData.io
- Featured news section for important stories
- India news filter
- Category filtering (General, Business, Technology, Entertainment, Sports, Science, Health)
- Search functionality
- Real-time weather information based on user location (defaults to New Delhi)
- Responsive design for all devices
- About, Privacy, and Contact information

## API Keys Used

- NewsAPI: `5e7bad98b99548c59ef093ed5ef77c70`
- The Guardian: `2772af90-c352-4a8d-ad2e-90e2f1061fa3`
- NewsData.io: `pub_75826eef5f45466bc36645f999f1d07627ded`
- OpenWeatherMap: `7c0c5224a43461f08c7bd34ed0118e55`

## How to Use

1. Open `index.html` in a web browser
2. Allow location access for weather information (optional, defaults to New Delhi)
3. Browse news by category or search for specific topics
4. Toggle "India News Only" to focus on news from India
5. Switch between different news sources to get varied perspectives

## India-Specific Features

- Default location set to New Delhi for weather
- "India News Only" toggle to filter news specifically about India
- News filter that recognizes Indian cities, states, and political terms
- "India" tag on news articles related to India
- Indian-inspired design elements with saffron and green accent colors

## Browser Compatibility

This website works best in modern browsers such as:
- Google Chrome
- Mozilla Firefox
- Safari
- Microsoft Edge

## CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) issues when fetching from the APIs, consider:

1. Using the included CORS proxy helper
2. Installing a CORS browser extension
3. Running the site on a local server

## Local Development

To run this website locally:

```bash
# Using Python 3
python -m http.server

# OR using Node.js
npx serve
```

Then open `http://localhost:8000` in your browser.

## Notes

- This project is for demonstration purposes only.
- The APIs used may have usage limitations.
- For a production environment, API keys should be secured and not exposed in client-side code.
- The website is optimized for an Indian audience but can be used globally. 