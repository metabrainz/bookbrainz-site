
/* eslint-disable */
const express = require('express')
const router = express.Router()

const options = {
  swaggerDefinition: {
    info: {
      title: 'BookBrainz API Documentation',
      version: '1.0.0',
      description: 'REST API with Swagger doc',
      contact: {
        email: 'akhileshithcse@gmail.com'
      }
    },
    schemes: ['http'],
    host: 'localhost:9098',
    basePath: '/'
  },
  apis: ['src/api/routes/*.js', 'src/api/*.js']
}

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const swaggerSpec = swaggerJSDoc(options)

router.get('/json', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


export default router;
