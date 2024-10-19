const translate = require('translate-google');

const translateMessage = async (message, language) => {
  if (language === 'vi') {
    try {
      const translatedMessage = await translate(message, { to: 'vi' });
      return translatedMessage;
    } catch (error) {
      console.error('Translation Error:', error);
      return message; // Fallback to original message if translation fails
    }
  }
  return message; // Return original message for 'en' or other languages
};

module.exports = {
  translateMessage,
};
