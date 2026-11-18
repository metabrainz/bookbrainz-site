import React from 'react';
import RelationshipTypeMatrix from '../../../src/client/components/pages/relationship-type-matrix';


export function meta() {
	return [{title: 'Relationship Types \u2013 BookBrainz'}];
}

export default function RelationshipTypes() {
	return <RelationshipTypeMatrix/>;
}
