/* eslint-disable no-process-env */

import {Router} from 'express';

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


const router = Router();
const isDev = process.env.NODE_ENV === 'development';
const API_VERSION = process.env.API_VERSION || '1';

const swaggerOptions = {
	apis: ['src/api/routes/*.js', 'src/api/*.js'],
	swaggerDefinition: {
		basePath: `/${API_VERSION}`,
		info: {
			contact: {
				email: 'akhileshithcse@gmail.com'
			},
			description: 'Swagger 2.0 documentation for the BookBrainz REST API.',
			title: 'BookBrainz API Documentation',
			version: '0.1.0'
		},
		schemes: [isDev ? 'http' : 'https']
	}
};

const swaggerUIOptions = {
	swaggerOptions: {
		deepLinking: true,
		defaultModelExpandDepth: 3,
		defaultModelsExpandDepth: 3,
		operationsSorter: 'alpha'
	}
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

router.get('/json', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(swaggerSpec);
});

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUIOptions));


export default router;
