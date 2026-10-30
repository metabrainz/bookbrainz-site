import AboutPage from '../../../src/client/components/pages/about';
import React from 'react';


export function meta() {
	return [{title: 'About \u2013 BookBrainz'}];
}

export default function About() {
	return <AboutPage/>;
}
