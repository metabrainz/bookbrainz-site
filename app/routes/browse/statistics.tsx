import React from 'react';
import type {Route} from './+types/statistics';
import StatisticsPage from '../../../src/client/components/pages/statistics';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export function meta() {
	return [{title: 'Statistics \u2013 BookBrainz'}];
}

export const loader = siteErrors(({context}: Route.LoaderArgs) => context.get(siteContext).backend.statistics.getPage());

export default function Statistics({loaderData}: Route.ComponentProps) {
	return <StatisticsPage {...loaderData}/>;
}
