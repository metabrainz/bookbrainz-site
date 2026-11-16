import * as React from 'react';

// eslint-disable-next-line import/named
import {FontAwesomeIconProps as FAProps, FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
	faBook, faGlobe, faGripVertical, faLayerGroup, faMagicWandSparkles, faPenNib, faUniversity, faUser, faUserCircle, faWindowRestore
} from '@fortawesome/free-solid-svg-icons';
import type {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {upperFirst} from 'lodash';


export const ENTITY_TYPE_ICONS = {
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
} satisfies Record<string, IconDefinition>;

type FASize = FAProps['size'];
export type EntityIconType = keyof typeof ENTITY_TYPE_ICONS;

/*
 * Only the entity types that have an icon are accepted. JavaScript callers are not checked: another string finds no
 * icon, which FontAwesome reports and renders as nothing.
 */
export function genEntityIconHTMLElement(entityType: EntityIconType, size: FASize = '1x', margin = true) {
	const correctCaseEntityType = upperFirst(entityType) as EntityIconType;
	return (
		<FontAwesomeIcon
			className={margin ? 'margin-right-0-3' : ''}
			icon={ENTITY_TYPE_ICONS[correctCaseEntityType]}
			size={size}
			title={correctCaseEntityType}
		/>);
}
