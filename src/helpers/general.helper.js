function stringToNumber(str) {
  let number = 0;
  for (let i = 0; i < str.length; i++) {
    number += str.charCodeAt(i) * (i + 1);
  }
  return number % 10000; // Modulo to limit the result to 4 digits
}

module.exports = { stringToNumber };
