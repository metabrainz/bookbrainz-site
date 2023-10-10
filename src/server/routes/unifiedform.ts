import * as middleware from '../helpers/middleware';
import {createEntitiesHandler, generateUnifiedProps, unifiedFormMarkup} from '../helpers/entityRouteUtils';
import {isAuthenticated, isAuthenticatedForHandler, isAuthorized} from '../helpers/auth';
import {PrivilegeType} from '../../common/helpers/privileges-utils';
import {escapeProps} from '../helpers/props';
import express from 'express';
import target from '../templates/target';


const {ENTITY_EDITOR} = PrivilegeType;

const router = express.Router();
router.get('/create', isAuthenticated, isAuthorized(ENTITY_EDITOR), middleware.loadIdentifierTypes,
	middleware.loadEditionStatuses, middleware.loadEditionFormats, middleware.loadEditionGroupTypes, middleware.loadSeriesOrderingTypes,
	middleware.loadLanguages, middleware.loadWorkTypes, middleware.loadGenders, middleware.loadPublisherTypes, middleware.loadAuthorTypes,
	middleware.loadRelationshipTypes, (req, res:express.Response) => {
		const props = generateUnifiedProps(req, res, {
			genderOptions: res.locals.genders
		});
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

router.post('/create/handler', isAuthenticatedForHandler, isAuthorized(ENTITY_EDITOR), createEntitiesHandler);

export default router;
