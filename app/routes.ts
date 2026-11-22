import {type RouteConfig, route} from '@react-router/dev/routes';

/*
 * The pages served by React Router. A page is added here together with the removal of its Express handler.
 * Route modules are grouped by feature under routes/. The 404 route comes last: it matches every URL no other
 * route matches.
 */
export default [
	route('*', 'routes/errors/not-found.tsx')
] satisfies RouteConfig;
