/* eslint-disable node/no-process-env */

import {Router} from 'express';

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


const router = Router();
const API_VERSION = process.env.API_VERSION || '1';

const swaggerOptions = {
	apis: ['src/api/routes/*.js', 'src/api/*.js'],
	swaggerDefinition: {
		basePath: '/{version}',
		info: {
			contact: {
				email: 'bookbrainz@metabrainz.org',
				name: 'BookBrainz',
				url: 'https://bookbrainz.org/'
			},
			description: `OpenAPI 3 documentation for the BookBrainz REST API.<br/>
			Breaking changes to the API will be announced <a href="https://blog.metabrainz.org/category/bookbrainz/" target="_blank">on our blog</a>.`,
			title: 'BookBrainz API Documentation',
			version: '0.2.0'
		},
		openapi: '3.0.3',
		servers: [{
			url: '/{version}',
			variables: {
				version: {
					default: API_VERSION,
					enum: ['1', API_VERSION]
				}
			}
		}]
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
