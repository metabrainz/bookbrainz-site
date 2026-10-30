import {type SiteContext, siteContext} from './context';
import {RouterContextProvider} from 'react-router';


/*
 * The one place that puts the values of a request into the context the loaders read. It runs inside the server build,
 * so the key (siteContext) is the same object the loaders use; Express only passes plain values.
 */
export function createLoadContext(values: SiteContext) {
	const context = new RouterContextProvider();
	context.set(siteContext, values);
	return context;
}
