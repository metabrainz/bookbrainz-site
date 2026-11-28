import {type RouteConfig, route} from '@react-router/dev/routes';

/*
 * The pages served by React Router. A page is added here together with the removal of its Express handler.
 * Route modules are grouped by feature under routes/. The 404 route comes last: it matches every URL no other
 * route matches.
 */
export default [
	route('about', 'routes/static/about.tsx'),
	route('contribute', 'routes/static/contribute.tsx'),
	route('develop', 'routes/static/develop.tsx'),
	route('faq', 'routes/static/faq.tsx'),
	route('help', 'routes/static/help.tsx'),
	route('licensing', 'routes/static/licensing.tsx'),
	route('privacy', 'routes/static/privacy.tsx'),
	route('*', 'routes/errors/not-found.tsx')
] satisfies RouteConfig;
