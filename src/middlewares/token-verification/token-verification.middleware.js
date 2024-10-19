const { stringToNumber } = require('../../helpers/general.helper');
const { verifyPaseto } = require('../../helpers/paseto.helper');

const authenticatePasetoToken = (req, res, next) => {
  // Get the JWT token from the request's Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({ message: 'No token provided.' });
  }

  // Check if the Authorization header starts with 'Bearer'
  if (authHeader.startsWith('Bearer ')) {
    // Extract the token from the header
    const token = authHeader.slice(7); // Removes 'Bearer ' prefix

    verifyPaseto(token)
      .then(user => {
        if (!user) {
          return res.status(403).json({
            data: null,
            error: {
              message: 'Invalid token',
              code: 403,
            },
          });
        }
        // If the token is valid, you can attach the user object to the request for later use in route handlers
        req.user = user;
        // Continue to the next middleware or route handler
        next();
      })
      .catch(error => {
        if (error) {
          return res.status(401).json({
            data: null,
            error: {
              message: error?.name + ': ' + error?.message,
              code: stringToNumber(error?.code),
            },
          });
        }
      });
  }
};

module.exports = authenticatePasetoToken;
