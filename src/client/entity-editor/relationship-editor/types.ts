/*
 * Copyright (C) 2018  Ben Ockmore
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

export type EntityType = string;

export type Entity = {
	bbid: string,
	defaultAlias?: {
		name: string
	},
	type: EntityType
};

export type RelationshipType = {
	id: number,
	childOrder: number,
	deprecated: boolean,
	depth?: number,
	description: string,
	label: string,
	linkPhrase: string,
	parentId: number,
	reverseLinkPhrase: string,
	sourceEntityType: EntityType,
	targetEntityType: EntityType
};

export type Relationship = {
	relationshipType: RelationshipType,
	sourceEntity: Entity,
	targetEntity: Entity
};

export type RelationshipWithLabel = {
	label: string,
	relationshipType: RelationshipType,
	sourceEntity: Entity,
	targetEntity: Entity
};

export type RelationshipForDisplay = {
	relationshipType: RelationshipType,
	sourceEntity: Entity,
	targetEntity: Entity,
	rowID: number
};

export type LanguageOption = {
	name: string,
	id: number
};
