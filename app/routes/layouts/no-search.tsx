import Layout from '../../../src/client/containers/layout';
import {Outlet} from 'react-router';
import React from 'react';
import {useSiteData} from '../../site-data';


// The pages that have a search of their own
export default function NoSearch() {
	return (
		<Layout {...useSiteData()} hideSearch>
			<Outlet/>
		</Layout>
	);
}
