import type {loader} from './root';
import {useRouteLoaderData} from 'react-router';


// The data of the site (user, alerts, translations), loaded by the root route for every page
export function useSiteData() {
	const site = useRouteLoaderData<typeof loader>('root');
	if (!site) {
		throw new Error('The root loader has not run');
	}
	return site;
}
