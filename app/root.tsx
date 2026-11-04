import {
	Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteLoaderData
} from 'react-router';
import ErrorPage from '../src/client/components/pages/error';
import React from 'react';
import type {Route} from './+types/root';
import SiteLayout from '../src/client/containers/layout';
import {siteContext} from './context';


const APPLE_TOUCH_ICON_SIZES = [57, 60, 72, 76, 114, 120, 144, 152, 180];

/* Only what the Layout needs is sent to the browser: no database handles, and of the user only these fields */
export function loader({context}: Route.LoaderArgs) {
	const {alerts, mergeQueue, repositoryUrl, siteRevision, user} = context.get(siteContext);
	return {
		alerts,
		mergeQueue,
		repositoryUrl,
		siteRevision,
		user: user && {id: user.id, name: user.name, privs: user.privs}
	};
}

export function links() {
	return [
		{href: '/stylesheets/bundle.css', rel: 'stylesheet'},
		{href: '/stylesheets/style.css', rel: 'stylesheet'},
		...APPLE_TOUCH_ICON_SIZES.map((size) => ({
			href: `/images/icons/apple-touch-icon-${size}x${size}.png`,
			rel: 'apple-touch-icon',
			sizes: `${size}x${size}`
		})),
		{href: '/images/icons/favicon-32x32.png', rel: 'icon', sizes: '32x32', type: 'image/png'},
		{href: '/images/icons/android-chrome-192x192.png', rel: 'icon', sizes: '192x192', type: 'image/png'},
		{href: '/images/icons/favicon-96x96.png', rel: 'icon', sizes: '96x96', type: 'image/png'},
		{href: '/images/icons/favicon-16x16.png', rel: 'icon', sizes: '16x16', type: 'image/png'},
		{href: '/manifest.json', rel: 'manifest'}
	];
}

/* The title of a page replaces this one: a route's meta() replaces its parent's, so only the title is set here */
export function meta() {
	return [{title: 'BookBrainz – The Open Book Database'}];
}

export function Layout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8"/>
				<meta content="width=device-width, initial-scale=1, shrink-to-fit=no" name="viewport"/>
				<meta content="BookBrainz" name="apple-mobile-web-app-title"/>
				<meta content="BookBrainz" name="application-name"/>
				<meta content="#da532c" name="msapplication-TileColor"/>
				<meta content="/images/icons/mstile-144x144.png" name="msapplication-TileImage"/>
				<meta content="#754e37" name="theme-color"/>
				<Meta/>
				<Links/>
			</head>
			<body>
				{children}
				<ScrollRestoration/>
				<Scripts/>
			</body>
		</html>
	);
}

export default function App({loaderData}: Route.ComponentProps) {
	return (
		<div id="target">
			<SiteLayout {...loaderData}>
				<Outlet/>
			</SiteLayout>
		</div>
	);
}

/* Errors from loaders (see errors.server.ts) render the existing error page, like the Express error handler does */
export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
	const site = useRouteLoaderData<typeof loader>('root') ?? {alerts: [], repositoryUrl: '', siteRevision: ''};
	let status = 500;
	let message = 'Unknown error';
	let detailedMessage: string | string[] | undefined;
	if (isRouteErrorResponse(error)) {
		({status} = error);
		if (typeof error.data === 'string') {
			message = error.data;
		}
		else {
			const details: unknown = error.data;
			if (typeof details === 'object' && details !== null) {
				if ('message' in details && typeof details.message === 'string') {
					({message} = details);
				}
				if ('detailedMessage' in details) {
					const detail = details.detailedMessage;
					if (typeof detail === 'string' || (Array.isArray(detail) && detail.every((item: unknown) => typeof item === 'string'))) {
						detailedMessage = detail;
					}
				}
			}
		}
	}
	else if (error instanceof Error) {
		({message} = error);
	}
	return (
		<div id="target">
			<SiteLayout {...site}>
				<ErrorPage error={{detailedMessage, message, status}}/>
			</SiteLayout>
		</div>
	);
}
