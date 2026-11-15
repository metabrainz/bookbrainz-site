import * as React from 'react';

// eslint-disable-next-line import/named
import {FontAwesomeIconProps as FAProps, FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
	faBook, faGlobe, faGripVertical, faLayerGroup, faMagicWandSparkles, faPenNib, faUniversity, faUser, faUserCircle, faWindowRestore
} from '@fortawesome/free-solid-svg-icons';
import type {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {upperFirst} from 'lodash';


export const ENTITY_TYPE_ICONS: Record<string, IconDefinition> = {
	Area: faGlobe,
	Author: faUser,
	Book: faMagicWandSparkles,
	Collection: faGripVertical,
	Edition: faBook,
	EditionGroup: faWindowRestore,
	Editor: faUserCircle,
	Publisher: faUniversity,
	Series: faLayerGroup,
	Work: faPenNib
};

type FASize = FAProps['size'];
export function genEntityIconHTMLElement(entityType: string, size: FASize = '1x', margin = true) {
	const correctCaseEntityType = upperFirst(entityType);
	if (!ENTITY_TYPE_ICONS[correctCaseEntityType]) { return null; }
	return (
		<FontAwesomeIcon
			className={margin ? 'margin-right-0-3' : ''}
			icon={ENTITY_TYPE_ICONS[correctCaseEntityType]}
			size={size}
			title={correctCaseEntityType}
		/>);
}
