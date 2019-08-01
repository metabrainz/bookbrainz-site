
/* eslint-disable */
const express = require('express')
const router = express.Router()

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'BookBrainz API Documentation',
      version: '0.1.0',
      description: 'Swagger 2.0 documentation for the BookBrainz REST API.',
      contact: {
        email: 'akhileshithcse@gmail.com'
      }
    },
    schemes: ['http']
  },
  apis: ['src/api/routes/*.js', 'src/api/*.js']
}

const swaggerUIOptions = {
  swaggerOptions: {
    deepLinking: true,
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    operationsSorter: 'alpha'
  }
};

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const swaggerSpec = swaggerJSDoc(swaggerOptions);

router.get('/json', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
});

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUIOptions));


export default router;
