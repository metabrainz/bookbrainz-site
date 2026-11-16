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
type EntityIconType = keyof typeof ENTITY_TYPE_ICONS;

// A known entity type always gets an icon
export function genEntityIconHTMLElement(entityType: EntityIconType, size?: FASize, margin?: boolean): React.JSX.Element;
export function genEntityIconHTMLElement(entityType: string, size?: FASize, margin?: boolean): React.JSX.Element | null;
export function genEntityIconHTMLElement(entityType: string, size: FASize = '1x', margin = true) {
	const correctCaseEntityType = upperFirst(entityType);
	const icon = (ENTITY_TYPE_ICONS as Record<string, IconDefinition | undefined>)[correctCaseEntityType];
	if (!icon) { return null; }
	return (
		<FontAwesomeIcon
			className={margin ? 'margin-right-0-3' : ''}
			icon={icon}
			size={size}
			title={correctCaseEntityType}
		/>);
}
