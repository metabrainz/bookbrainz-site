/*
 * Copyright (C) 2019  Akhilesh Kumar
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

// @flow


import _ from 'lodash';

/**
 * This is function to get alias data from entity data
 *
 * @param {object} entity - Entity datail which is fetched from database
 * @returns {object} aliasData - Data of default alias of entity
 *
 * @example
 *
 *		getDefaultAlias(entity: onject)
 */

function getDefaultAlias(entity: object) {
	return {
		aliasLanguage: _.get(entity, 'defaultAlias.language.name', null),
		name: _.get(entity, 'defaultAlias.name', null),
		sortName: _.get(entity, 'defaultAlias.sortName', null)
	};
}

/**
 * This is function to get language detail from entity data
 *
 * @param {object} entity - Entity datail which is fetched from the database
 * @returns {string[]} languages - List of languages of entity
 *
 * @example
 *
 *		getLanguages(entity: object)
 */

function getLanguages(entity: object) {
	return _.get(entity, 'languageSet.languages', []).map((language) => language.name);
}

/**
 * getWorkBasicInfo is function to extract the basic detail of work to
 * send the response to the api
 *
 * @param {object} work - Work data which is fetched from the database
 * @returns {object} workDetail - Basic data of work entity for api response
 *
 * @example
 *
 *		getWorkBasicInfo(work: object)
 */

export function getWorkBasicInfo(work: object) {
	return _.isNil(work) ? null :
		{
			bbid: _.get(work, 'bbid', null),
			defaultAlias: getDefaultAlias(work),
			disambiguation: _.get(work, 'disambiguation.comment', null),
			entityType: _.get(work, 'type', null),
			languages: getLanguages(work),
			workType: _.get(work, 'workType.label', null)
		};
}

/**
 * getEditionBasicInfo is function to extract the basic detail of edition to
 * send the response to the api
 *
 * @param {object} editon - Edition data which is fetched from the database
 * @returns {object} editionDetail - Basic data of edition entity for api response
 *
 * @example
 *
 *		getEditionBasicInfo(editon: object)
 */

export function getEditionBasicInfo(edition: object) {
	return _.isNil(edition) ? null :
		{
			bbid: _.get(edition, 'bbid', null),
			defaultAlias: getDefaultAlias(edition),
			depth: _.get(edition, 'depth', null),
			disambiguation: _.get(edition, 'disambiguation.comment', null),
			editionFormat: _.get(edition, 'editionFormat.label', null),
			hight: _.get(edition, 'hight', null),
			languages: getLanguages(edition),
			pages: _.get(edition, 'pages', null),
			releaseEventDates: _.get(edition, 'releaseEventSet.releaseEvents', []).map((event) => event.date),
			status: _.get(edition, 'editionStatus.label', null),
			weight: _.get(edition, 'weight', null),
			width: _.get(edition, 'width', null)
		};
}

/**
 * getEditionGroupBasicInfo is function to extract the basic detail of edition-group to
 * send the response to the api
 *
 * @param {object} editionGroup - Edition data which is fetched from the database
 * @returns {object} editionGroupDetail - Basic data of edition-group entity for api response
 *
 * @example
 *
 *		getEditionGroupBasicInfo(editionGroup: object)
 */

export function getEditionGroupBasicInfo(editionGroup: object) {
	return _.isNil(editionGroup) ? null :
		{
			bbid: _.get(editionGroup, 'bbid', null),
			defaultAlias: getDefaultAlias(editionGroup),
			disambiguation: _.get(editionGroup, 'disambiguation.comment', null),
			type: _.get(editionGroup, 'editionGroupType.label')
		};
}

/**
 * getAuthorBasicInfo is function to extract the basic detail of author to
 * send the response to the api
 *
 * @param {object} author - Author data which is fetched from the database
 * @returns {object} authorDetail - Basic data of author entity for api response
 *
 * @example
 *
 *		getAuthorBasicInfo(author: object)
 */

export function getAuthorBasicInfo(author: object) {
	return _.isNil(author) ? null :
		{
			bbid: _.get(author, 'bbid', null),
			beginArea: _.get(author, 'beginArea.name', null),
			beginDate: _.get(author, 'beginDate', null),
			defaultAlias: getDefaultAlias(author),
			disambiguation: _.get(author, 'disambiguation.comment', null),
			endArea: _.get(author, 'endArea.name', null),
			endDate: _.get(author, 'endDate', null),
			ended: _.get(author, 'ended', null),
			gender: _.get(author, 'gender.name', null),
			type: _.get(author, 'authorType.label', null)
		};
}

/**
 * getPublisherBasicInfo is function to extract the basic detail of publisher to
 * send the response to the api
 *
 * @param {object} publisher - Publisher data which is fetched from the database
 * @returns {object} publisher - Basic data of publisher entity for api response
 *
 * @example
 *
 *		getPublisherBasicInfo(publisher: object)
 */

export function getPublisherBasicInfo(publisher: object) {
	return _.isNil(publisher) ? null :
		{
			area: _.get(publisher, 'area.name', null),
			bbid: _.get(publisher, 'bbid', null),
			beginDate: _.get(publisher, 'beginDate', null),
			defaultAlias: getDefaultAlias(publisher),
			disambiguation: _.get(publisher, 'disambiguation.comment', null),
			endDate: _.get(publisher, 'endDate', null),
			ended: _.get(publisher, 'ended', null),
			type: _.get(publisher, 'publisherType.label', null)
		};
}

/**
 * getEntityAliases is function to extract the list of aliases of an entity
 *
 * @param {object} entity - Entity data which is fetched from the database
 * @returns {object[]} aliases - List of aliases of an entity for api response
 *
 * @example
 *
 *		getEntityAliases(entity: object)
 */

export function getEntityAliases(entity: object) {
	return _.isNil(entity) ? null :
		{
			aliases: _.get(entity, 'aliasSet.aliases', []).map((alias) => ({
				aliasLanguage: _.get(alias, 'language.name', null),
				name: _.get(alias, 'name', null),
				primary: _.get(alias, 'primary', null),
				sortName: _.get(alias, 'sortName', null)
			})),
			bbid: _.get(entity, 'bbid', null)
		};
}

/**
 * getEntityIdentifiers is function to extract the list of indentifiers of an entity
 *
 * @param {object} entity - Entity data which is fetched from the database
 * @returns {object[]} identifiers - List of identifiers of an entity for api response
 *
 * @example
 *
 *		getEntityIdentifiers(entity: object)
 */

export function getEntityIdentifiers(entity: object) {
	return _.isNil(entity) ? null :
		{
			bbid: _.get(entity, 'bbid', null),
			identifiers: _.get(entity, 'identifierSet.identifiers', []).map((identifier) => ({
				type: _.get(identifier, 'type.label', null),
				value: _.get(identifier, 'value', null)
			}))
		};
}

/**
 * getEntityRelationships is function to extract the list of relationshiops of an entity
 *
 * @param {object} entity - Entity data which is fetched from the database
 * @returns {object[]} relationships - List of relationships of an entity for api response
 *
 * @example
 *
 *		getEntityRelationships(entity: object)
 */


export function getEntityRelationships(entity: object) {
	return _.isNil(entity) ? null :
		{
			bbid: _.get(entity, 'bbid', null),
			relationships: _.get(entity, 'relationshipSet.relationships', []).map((relationship) => {
				const isItSourceEntity = entity.bbid === relationship.sourceBbid;
				return {
					direction: isItSourceEntity ? 'forward' : 'backward',
					id: relationship.id,
					linkPhrase: isItSourceEntity ?
						_.get(relationship, 'type.linkPhrase', null) :
						_.get(relationship, 'type.reverseLinkPhrase', null),
					relationshipTypeId: _.get(relationship, 'type.id', null),
					relationshipTypeName: _.get(relationship, 'type.label', null),
					targetBbid: isItSourceEntity ?
						_.get(relationship, 'targetBbid', null) :
						_.get(relationship, 'sourceBbid', null),
					targetEntityType: isItSourceEntity ?
						_.get(relationship, 'type.targetEntityType', null) :
						_.get(relationship, 'type.sourceEntityType', null)
				};
			})
		};
}
