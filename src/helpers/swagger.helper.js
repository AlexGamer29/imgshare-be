// src/helpers/swagger.helper.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { PORT, API_VERSION } = require('../config/config');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API Documentation for the project',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/${API_VERSION}`, // Adjust to your server URL
      },
      {
        url: `https://moxci.net/api/${API_VERSION}`, // Adjust to your server URL
      },
    ],
  },
  apis: [
    './src/routes/**/*.js', // Optionally include all routes
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
