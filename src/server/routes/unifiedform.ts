import {createEntitesHandler} from '../helpers/entityRouteUtils';
import express from 'express';
import {isAuthenticatedForHandler} from '../helpers/auth';


const router = express.Router();
router.post('/create/handler', isAuthenticatedForHandler, createEntitesHandler);
export default router;
