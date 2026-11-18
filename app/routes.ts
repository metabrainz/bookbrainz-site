import {type RouteConfig, index, layout, route} from '@react-router/dev/routes';

/*
 * The pages served by React Router. A page is added here together with the removal of its Express handler.
 * Route modules are grouped by feature under routes/. Each layout route renders the frame of the site around the
 * pages inside it. The 404 route comes last: it matches every URL no other route matches.
 */
export default [
	layout('routes/layouts/site.tsx', [
		route('about', 'routes/static/about.tsx'),
		route('collections', 'routes/browse/collections.tsx'),
		route('contribute', 'routes/static/contribute.tsx'),
		route('develop', 'routes/static/develop.tsx'),
		route('faq', 'routes/static/faq.tsx'),
		route('help', 'routes/static/help.tsx'),
		route('licensing', 'routes/static/licensing.tsx'),
		route('privacy', 'routes/static/privacy.tsx'),
		route('relationship-types', 'routes/types/relationship-types-matrix.tsx'),
		route('revisions', 'routes/browse/revisions.tsx'),
		route('statistics', 'routes/browse/statistics.tsx')
	]),
	layout('routes/layouts/no-search.tsx', [
		route('search', 'routes/browse/search.tsx')
	]),
	layout('routes/layouts/home.tsx', [
		index('routes/home/home.tsx')
	]),
	route('*', 'routes/errors/not-found.tsx')
] satisfies RouteConfig;
