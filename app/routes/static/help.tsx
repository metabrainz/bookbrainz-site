import HelpPage from '../../../src/client/components/pages/help';
import React from 'react';


export function meta() {
	return [{title: 'Help \u2013 BookBrainz'}];
}

export default function Help() {
	return <HelpPage/>;
}
