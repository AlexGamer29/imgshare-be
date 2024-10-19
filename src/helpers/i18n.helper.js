const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: './src/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'en', // Default language
    preload: ['en', 'vi'], // Load necessary languages
    detection: {
      order: ['querystring', 'cookie', 'header'],
      lookupQuerystring: 'lang',
      caches: ['cookie'],
      cookieMinutes: 10, // Set how long the language should be cached in the cookie
      cookieDomain: 'myDomain', // Change to your domain if needed
    },
    debug: false, // Enable debug to see which language is detected
  });

module.exports = i18next;
