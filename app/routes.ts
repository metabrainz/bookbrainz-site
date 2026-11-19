import {type RouteConfig, index, layout, route} from '@react-router/dev/routes';

/*
 * The pages served by React Router. A page is added here together with the removal of its Express handler.
 * Route modules are grouped by feature under routes/. Each layout route renders the frame of the site around the
 * pages inside it. The 404 route comes last: it matches every URL no other route matches.
 */
export default [
	layout('routes/layouts/site.tsx', [
		route('about', 'routes/static/about.tsx'),
		route('admin-logs', 'routes/admin/admin-logs.tsx'),
		route('collections', 'routes/browse/collections.tsx'),
		route('contribute', 'routes/static/contribute.tsx'),
		route('develop', 'routes/static/develop.tsx'),
		route('editor/edit', 'routes/editor/edit.tsx'),
		route('external-service', 'routes/external-service.tsx'),
		route('faq', 'routes/static/faq.tsx'),
		route('help', 'routes/static/help.tsx'),
		route('identifier-type/create', 'routes/type-editors/identifier-type-create.tsx'),
		route('identifier-types', 'routes/types/identifier-types.tsx'),
		route('licensing', 'routes/static/licensing.tsx'),
		route('privacy', 'routes/static/privacy.tsx'),
		route('register', 'routes/register/register.tsx'),
		route('register/details', 'routes/register/details.tsx'),
		route('relationship-types', 'routes/types/relationship-types-matrix.tsx'),
		route('relationship-types/:types', 'routes/types/relationship-types-list.tsx'),
		route('revisions', 'routes/browse/revisions.tsx'),
		route('search-admin', 'routes/admin/search-admin.tsx'),
		route('statistics', 'routes/browse/statistics.tsx')
	]),
	layout('routes/layouts/no-search.tsx', [
		route('admin-panel', 'routes/admin/admin-panel.tsx'),
		route('search', 'routes/browse/search.tsx')
	]),
	layout('routes/layouts/home.tsx', [
		index('routes/home/home.tsx')
	]),
	route('*', 'routes/errors/not-found.tsx')
] satisfies RouteConfig;
