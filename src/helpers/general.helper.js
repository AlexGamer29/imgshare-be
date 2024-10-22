const crypto = require('crypto');

function stringToNumber(str) {
  let number = 0;
  for (let i = 0; i < str.length; i++) {
    number += str.charCodeAt(i) * (i + 1);
  }
  return number % 10000; // Modulo to limit the result to 4 digits
}

// Helper function to generate unique hash
function generateHash() {
  const timestamp = Date.now(); // Get current timestamp in milliseconds
  const randomBytes = crypto.randomBytes(16).toString('hex'); // Generate random bytes
  const combined = `${timestamp}-${randomBytes}`; // Append timestamp before the random hash
  // Hash the combined timestamp and random bytes to ensure uniqueness
  const hash = crypto.createHash('md5').update(combined).digest('hex'); // Hash with SHA-256
  return hash;
}

// Helper function to get the current date in YYYYMMDD format
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`; // Returns YYYYMMDD
}

module.exports = { stringToNumber, generateHash, getCurrentDate };
