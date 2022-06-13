import * as middleware from '../helpers/middleware';
import {generateUnifiedProps, unifiedFormMarkup} from '../helpers/entityRouteUtils';
import {escapeProps} from '../helpers/props';
import express from 'express';
import {isAuthenticated} from '../helpers/auth';
import target from '../templates/target';


type PassportRequest = express.Request & {user: any, session: any};

const router = express.Router();
router.get('/create', isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadEditionStatuses, middleware.loadEditionFormats,
	middleware.loadLanguages, middleware.loadWorkTypes, middleware.loadGenders, middleware.loadPublisherTypes, middleware.loadAuthorTypes,
	middleware.loadRelationshipTypes, (req:PassportRequest, res:express.Response) => {
		const props = generateUnifiedProps(req, res, {});
		const formMarkup = unifiedFormMarkup(props);
		const {markup, props: updatedProps} = formMarkup;
		return res.send(target({
			markup,
			page: 'Unified form',
			props: escapeProps(updatedProps),
			script: '/js/unified-form.js',
			title: 'Unified  form'
		}));
	});

export default router;
