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

export type AttributeTypes = {
	id: number,
	parent: number | null,
	root: number,
	childOrder: number | null,
	name: string,
	description: string | null,
};

export type RelationshipType = {
	id: number,
	attributeTypes?: Array<AttributeTypes>,
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
export type Attribute = {
	attributeType: number,
	value: {
		textValue: string | null
	},
	type?: AttributeTypes
};

export type Relationship = {
	relationshipType: RelationshipType,
	sourceEntity: Entity,
	targetEntity: Entity,
	attributes?: Array<Attribute>
};

export type RelationshipWithLabel = {
	label: string,
	relationshipType: RelationshipType,
	sourceEntity: Entity,
	targetEntity: Entity
};

export type RelationshipForDisplay = {
	attributes: Array<Attribute>,
	isAdded: boolean,
	isRemoved: boolean,
	relationshipType: RelationshipType,
	sourceEntity: Entity,
	targetEntity: Entity,
	rowID: string
};

export type LanguageOption = {
	name: string,
	id: number
};

export enum RelationshipTypes {
	AuthorWorkedOnWork = 1,
	AuthorIllustratedEdition = 2,
	EditionIsAnEditionOfEditionGroup = 3,
	PublisherPublishedEdition = 4,
	AuthorEditedEdition = 5,
	WorkInspiredWork = 6,
	WorkIsParodyOfWork = 7,
	AuthorWroteWork = 8,
	AuthorTranslatedWork = 9,
	EditionContainsWork = 10,
	AuthorMarriedToAuthor = 11,
	AuthorInvolvedWithAuthor = 12,
	AuthorMemberOfGroup = 13,
	AuthorParentOfAuthor = 14,
	AuthorSiblingOfAuthor = 15,
	SubgroupOfGroup = 16,
	AuthorFoundedGroup = 17,
	AuthorIsPenNameOf = 18,
	AuthorIsCollaboratorOnShortTermProject = 19,
	AuthorIsFounderOfPublisher = 20,
	AuthorEmployedByPublisher = 21,
	AuthorProofReadEdition = 22,
	AuthorCompiledEdition = 23,
	AuthorDesignedEdition = 24,
	AuthorTypesetEdition = 25,
	AuthorProvidedPhotographyForEdition = 26,
	AuthorWroteBlurbForEdition = 27,
	AuthorIsArtDirectorForEdition = 28,
	AuthorIllustratedWork = 29,
	AuthorInkedWork = 30,
	AuthorProvidedStoryForWork = 31,
	AuthorLetteredWork = 32,
	AuthorProvidedArtForWork = 33,
	AuthorRevisedWork = 34,
	AuthorReconstructedWork = 35,
	AuthorHasDedicationInWork = 36,
	AuthorHasPreviousAttributionForWork = 37,
	AuthorCommissionedWork = 38,
	AuthorLicensedWork = 39,
	PublisherIsOwnerOfPublisher = 40,
	PublisherRenamed = 41,
	PublisherSplitToPublishers = 42,
	PublisherMergedFromPublishers = 43,
	PublisherHoldsCopyrightForEdition = 44,
	PublisherLicensedEdition = 45,
	PublisherLicenseeEdition = 46,
	PublisherManufacturedEdition = 47,
	PublisherPromotedEdition = 48,
	PublisherDistributedEdition = 49,
	PublisherCommissionedWork = 50,
	PublisherLicensedWork = 51,
	EditionIsRevisionOfEdition = 52,
	WorkQuotesWork = 53,
	WorkHasPartOfWork = 54,
	WorkDerivedFromWork = 55,
	WorkIsTranslationOfWork = 56,
	EditionIsReprintOfEdition = 57,
	AuthorContributedToWork = 58,
	AuthorProvidedPhotographsForWork = 59,
	AuthorPencilledWork = 60,
	AuthorColouredWork = 61,
	AuthorAdaptedWork = 62,
	AuthorHasCopyrightOverWork = 63,
	WorkIsAboutAuthor = 64,
	WorkContainsExcerptsOfWork = 65,
	WorkCitesWork = 66,
	WorkIsAdaptionOfWork = 67,
	WorkIsRevisionOfWork = 68,
	WorkIsReconstructionOfWork = 69
}
