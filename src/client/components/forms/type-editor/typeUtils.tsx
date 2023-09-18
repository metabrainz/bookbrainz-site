/*
 * Copyright (C) 2023 Shivam Awasthi
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {ENTITY_TYPES} from '../../../helpers/entity';
import type {EntityTypeString} from 'bookbrainz-data/lib/types/entity';
import React from 'react';


export interface RelationshipTypeDataT {
	attributeTypes: number[];
	id?: number;
	label: string;
	description: string;
	linkPhrase: string;
	reverseLinkPhrase: string;
	deprecated: boolean;
	parentId: number | null;
	childOrder: number;
	sourceEntityType: EntityTypeString;
	targetEntityType: EntityTypeString;
}

export interface IdentifierTypeDataT {
	childOrder: number;
	deprecated: boolean;
	description: string;
	detectionRegex: string | null;
	displayTemplate: string;
	entityType: EntityTypeString;
	id?: number;
	label: string;
	parentId: number | null;
	validationRegex: string;
}

export interface AttributeTypeDataT {
	childOrder: number,
	description: string,
	id?: number,
	lastUpdated: Date,
	name: string,
	parent: number | null,
	root: number
}

export interface RelationshipTypeEditorPropsT {
	relationshipTypeData: RelationshipTypeDataT;
	parentTypes: RelationshipTypeDataT[];
	attributeTypes: AttributeTypeDataT[];
	user: any;
}

export interface IdentifierTypeEditorPropsT {
	identifierTypeData: IdentifierTypeDataT;
	parentTypes: IdentifierTypeDataT[];
	user: any;
}

export const defaultRelationshipTypeData: RelationshipTypeDataT = {
	attributeTypes: [],
	childOrder: 0,
	deprecated: false,
	description: '',
	label: '',
	linkPhrase: '',
	parentId: null,
	reverseLinkPhrase: '',
	sourceEntityType: null,
	targetEntityType: null
};

export const defaultIdentifierTypeData: IdentifierTypeDataT = {
	childOrder: 0,
	deprecated: false,
	description: '',
	detectionRegex: null,
	displayTemplate: '',
	entityType: null,
	label: '',
	parentId: null,
	validationRegex: ''
};

export const entityTypeOptions = ENTITY_TYPES.map((entity) => ({
	name: entity
}));

export function renderSelectedParentRelationshipType(selectedParentID: number, childOrder: number, parentTypes: RelationshipTypeDataT[]) {
	const parent = parentTypes.find(relationship => relationship.id === selectedParentID);
	if (parent) {
		return (
			<div className="small">
				<div>
					<strong>Forward Phrase:&nbsp;</strong>{parent.sourceEntityType}&nbsp;{parent.linkPhrase}&nbsp;{parent.targetEntityType}
				</div>
				<div>
					<strong>Reverse Phrase:&nbsp;</strong>{parent.targetEntityType}&nbsp;{parent.reverseLinkPhrase}&nbsp;{parent.sourceEntityType}
				</div>
				<div><strong>Child Order:&nbsp;</strong>{childOrder}</div>
			</div>
		);
	}
	return null;
}

export function renderSelectedParentIdentifierType(selectedParentID: number, childOrder: number, parentTypes: IdentifierTypeDataT[]) {
	const parent = parentTypes.find(identifierType => identifierType.id === selectedParentID);
	if (parent) {
		return (
			<div className="small">
				<div>
					<strong>Label:&nbsp;</strong>{parent.label}
				</div>
				<div>
					<strong>Description:&nbsp;</strong>{parent.description}
				</div>
				<div><strong>Child Order:&nbsp;</strong>{childOrder}</div>
			</div>
		);
	}
	return null;
}

