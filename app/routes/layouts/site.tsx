import Layout from '../../../src/client/containers/layout';
import {Outlet} from 'react-router';
import React from 'react';
import {useSiteData} from '../../site-data';


export default function Site() {
	return (
		<Layout {...useSiteData()}>
			<Outlet/>
		</Layout>
	);
}
