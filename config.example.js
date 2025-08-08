// Configuration template - Copy to config.js and add your API key
// DO NOT COMMIT config.js TO GIT
const CONFIG = {
    OPENROUTER_API_KEY: 'your-api-key-here', // Get from https://openrouter.ai/keys
    API_BASE_URL: 'https://openrouter.ai/api/v1/chat/completions',
    MODEL: 'openai/gpt-4o-mini',
    SITE_NAME: 'BookPeckers',
    SITE_URL: 'https://bookpeckers.com'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}