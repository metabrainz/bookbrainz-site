import Layout from '../../../src/client/containers/layout';
import {Outlet} from 'react-router';
import React from 'react';
import {useSiteData} from '../../site-data';


export default function Home() {
	const site = useSiteData();
	// Someone who is logged in gets the notice that the site needs JavaScript
	return (
		<Layout {...site} homepage requiresJS={Boolean(site.user)}>
			<Outlet/>
		</Layout>
	);
}
