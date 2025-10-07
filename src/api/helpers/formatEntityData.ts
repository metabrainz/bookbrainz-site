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


import _ from 'lodash';

/**
 * A function to extract the default alias from ORM entity
 * @function
 * @param {object} entity - an ORM entity
 * @returns {object} an object containing default alias of an ORM entity.
 * Each property defaults to null.
 *
 * @example
 *		getDefaultAlias(entity);
 *		/* => {
			"language": "eng",
			"name": "H. Beam Piper",
			"sortName": "Piper, H. Beam"
		}
 */

function getDefaultAlias(entity: Record<string, unknown> | null | undefined) {
	return {
		language: _.get(entity, 'defaultAlias.language.isoCode3', null),
		name: _.get(entity, 'defaultAlias.name', null),
		primary: _.get(entity, 'defaultAlias.primary', null),
		sortName: _.get(entity, 'defaultAlias.sortName', null)
	};
}

/**
 * A function to extract the languages from ORM entity
 * @function
 * @param {object} entity - an ORM entity
 * @returns {string[]} an array containing three letter ISO 639-3 language codes of an ORM entity.
 * By default it return []
 *
 * @example
 *		getLanguages(entity);
 *		/* => ['hin', 'eng', 'spa']
 */

function getLanguages(entity: any) {
	return _.get(entity, 'languageSet.languages', []).map(({isoCode3}) => isoCode3);
}

/**
 * A function to extract the basic details of a Work ORM entity
 * @function
 * @param {object} work - a work ORM entity
 * @returns {object} an object containing the basic data of a Work entity.
 * Each property defaults to null. If work is null or undefined, returns null.
 *
 * @example
 * 		const work = await orm.func.entity.getEntity(orm, 'Work', bbid, relations);
 *		getWorkBasicInfo(work);
 *		/* => {
			"bbid": "ba446064-90a5-447b-abe5-139be547da2e",
			"defaultAlias": {
				"language": "eng",
				"name": "Harry Potter",
				"primary": true,
				"sortName": "Harry Potter"
			},
			"disambiguation": null,
			"entityType": "Work",
			"languages": [
				"eng"
			],
			"workType": "Epic"
		}
 */

export function getWorkBasicInfo(work: Record<string, unknown> | null | undefined) {
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
 * A function to extract structured author credit details from an Edition ORM entity.
 * @function
 * @param {object} edition - an edition ORM entity
 * @returns {object|null} an object containing the author credit data, or null if not available.
 *
 * @example
 * 		const edition = await orm.func.entity.getEntity(orm, 'Edition', bbid, relations);
 *		getAuthorCredits(edition);
 *		/* => {
 *			"authorCount": 1,
 *			"id": 135,
 *			"names": [
 *				{
 *					"authorBBID": "e5c4e68b-bfce-4c77-9ca2-0f0a2d4d09f0",
 *					"authorCreditID": 135,
 *					"name": "J. K. Rowling"
 *				}
 *			]
 *		}
 */

export function getAuthorCredits(edition: any) {
	if (_.isNil(edition?.authorCredit)) { return null; }

	const {authorCredit} = edition;
	const {id, authorCount, names} = authorCredit;
	return {
		authorCount: authorCount ?? null,
		id: id ?? null,
		names: names ?? []
	};
}

/**
 * A function to extract basic publisher information from an Edition ORM entity.
 * @function
 * @param {object} edition - an edition ORM entity
 * @returns {Array<object>} an array of objects containing publisher set data, or null if not available.
 *
 * @example
 * 		const edition = await orm.func.entity.getEntity(orm, 'Edition', bbid, relations);
 *		filterPublishers(edition);
 *		/* => [
 *    		{
 *      	  "bbid": "d30d7df9-eb6f-4bd5-a69f-a9a3362a6f4a",
 *      	  "name": "Bloomsbury",
 *     	 	  "sortName": "Bloomsbury"
 *    		}
 * 		]
 */

export function filterPublishers(edition: any) {
	return _.isNil(edition?.publisherSet) ? null : (edition.publisherSet.publishers ?? []).map(({bbid, name, sortName}) => ({
		bbid,
		name,
		sortName
	}));
}

/**
 * A function to extract the basic details of an Edition ORM entity
 * @function
 * @param {object} edition - an edition ORM entity
 * @returns {object} an object containing the basic data of an Edition entity.
 * Each property defaults to null. If edition is null or undefined, returns null.
 *
 * @example
 * 		const work = await orm.func.entity.getEntity(orm, 'Edition', bbid, relations);
 *		getEditionBasicInfo(work);
 *		/* => {
			"authorCredits": {
				"authorCount": 1,
				"id": 135,
				"names": [
				{
					"authorCreditID": 135,
					"position": 0,
					"authorBBID": "e5c4e68b-bfce-4c77-9ca2-0f0a2d4d09f0",
					"name": "J. K. Rowling",
					"joinPhrase": ""
				}
				]
			},
			"bbid": "ceb76296-45a4-44fe-a1da-8ae6ff341f96",
			"defaultAlias": {
				"language": "eng",
				"name": "Harry Potter and the Deathly Hallows",
				"primary": true,
				"sortName": "Harry Potter and the Deathly Hallows"
			},
			"depth": 45,
			"disambiguation": null,
			"editionFormat": "Hardcover",
			"height": 205,
			"languages": [
				"eng"
			],
			"pages": 607,
			"publishers": [
				{
				"bbid": "d30d7df9-eb6f-4bd5-a69f-a9a3362a6f4a",
				"name": "Bloomsbury",
				"sortName": "Bloomsbury"
				}
			],
			"releaseEventDate": "+002007-07-21",
			"status": "Official",
			"weight": null,
			"width": 135
		}
 */

export function getEditionBasicInfo(edition: any) {
	return _.isNil(edition) ? null :
		{
			authorCredits: getAuthorCredits(edition),
			bbid: _.get(edition, 'bbid', null),
			defaultAlias: getDefaultAlias(edition),
			depth: _.get(edition, 'depth', null),
			disambiguation: _.get(edition, 'disambiguation.comment', null),
			editionFormat: _.get(edition, 'editionFormat.label', null),
			height: _.get(edition, 'height', null),
			languages: getLanguages(edition),
			pages: _.get(edition, 'pages', null),
			publishers: filterPublishers(edition),
			releaseEventDate: _.get(edition, 'releaseEventSet.releaseEvents[0].date', ''),
			status: _.get(edition, 'editionStatus.label', null),
			weight: _.get(edition, 'weight', null),
			width: _.get(edition, 'width', null)
		};
}

/**
 * A function to extract the basic details of an EditionGroup ORM entity
 * @function
 * @param {object} editionGroup - an editionGroup ORM entity
 * @returns {object} an object containing the basic data of an EditionGroup entity.
 * Each property defaults to null. If author is null or undefined, returns null.
 *
 * @example
 * 		const editionGroup = await orm.func.entity.getEntity(orm, 'EditionGroup', bbid, relations);
 *		getEditionGroupBasicInfo(editionGroup);
 *		/* => {
			"bbid": "3889b695-70d5-4933-9f08-defad217623e",
			"defaultAlias": {
				"language": "eng",
				"name": "A Suitable Boy",
				"primary": true,
				"sortName": "Suitable Boy, A"
			},
			"disambiguation": null,
			"type": "Book"
		}
 */

export function getEditionGroupBasicInfo(editionGroup: Record<string, unknown> | null | undefined) {
	return _.isNil(editionGroup) ? null :
		{
			bbid: _.get(editionGroup, 'bbid', null),
			defaultAlias: getDefaultAlias(editionGroup),
			disambiguation: _.get(editionGroup, 'disambiguation.comment', null),
			editionGroupType: _.get(editionGroup, 'editionGroupType.label', null)
		};
}


/**
 * A function to extract the basic details of an Series ORM entity
 * @function
 * @param {object} series - an series ORM entity
 * @returns {object} an object containing the basic data of an Series entity.
 * Each property defaults to null. If series is null or undefined, returns null.
 *
 * @example
 * 		const series = await orm.func.entity.getEntity(orm, 'Series', bbid, relations);
 *		getSeriesBasicInfo(series);
 *		/* => {
			"bbid": "3889b695-70d5-4933-9f08-defad217623e",
			"defaultAlias": {
				"language": "eng",
				"name": "The Lord of the Rings",
				"primary": true,
				"sortName": "Lord of the Rings, The"
			},
			"disambiguation": null,
			"seriesOrderingType": "Automatic",
			"seriesType": "Work"
		}
 */

export function getSeriesBasicInfo(series: Record<string, unknown> | null | undefined) {
	return _.isNil(series) ? null :
		{
			bbid: _.get(series, 'bbid', null),
			defaultAlias: getDefaultAlias(series),
			disambiguation: _.get(series, 'disambiguation.comment', null),
			seriesOrderingType: _.get(series, 'seriesOrderingType.label'),
			seriesType: _.get(series, 'entityType', null)
		};
}

/**
 * A function to extract the basic details of an Author ORM entity
 * @function
 * @param {object} author - an Author ORM entity
 * @returns {object} an object containing the basic data of an Author entity.
 * Each property defaults to null. If author is null or undefined, returns null.
 *
 * @example
 * 		const author = await orm.func.entity.getEntity(orm, 'Author', bbid, relations);
 *		getAuthorBasicInfo(author);
 *		/* => {
			"bbid": "86f86a31-7c51-49ed-af71-9523cca30265",
			"beginArea": null,
			"beginDate": "1904-03-23",
			"defaultAlias": {
				"language": "eng",
				"name": "H. Beam Piper",
				"primary": true,
				"sortName": "Piper, H. Beam"
			},
			"disambiguation": null,
			"endArea": null,
			"endDate": "1964-11-06",
			"ended": true,
			"gender": "Male",
			"type": "Person"
		}
 */

export function getAuthorBasicInfo(author: Record<string, unknown> | null | undefined) {
	return _.isNil(author) ? null :
		{
			authorType: _.get(author, 'authorType.label', null),
			bbid: _.get(author, 'bbid', null),
			beginArea: _.get(author, 'beginArea.name', null),
			beginDate: _.get(author, 'beginDate', null),
			defaultAlias: getDefaultAlias(author),
			disambiguation: _.get(author, 'disambiguation.comment', null),
			endArea: _.get(author, 'endArea.name', null),
			endDate: _.get(author, 'endDate', null),
			ended: _.get(author, 'ended', null),
			gender: _.get(author, 'gender.name', null)
		};
}

/**
 * A function to extract the basic details of a Publisher ORM entity
 * @function
 * @param {object} publisher - a Publisher ORM entity
 * @returns {object} an object containing the basic data of a Publisher entity.
 * Each property defaults to null. If publisher is null or undefined, returns null.
 *
 * @example
 * 		const author = await orm.func.entity.getEntity(orm, 'Publisher', bbid, relations);
 *		getPublisherBasicInfo(publisher);
 *		/* => {
			"area": "India",
			"bbid": "e418874e-5684-4fe9-9d2d-1b7e5d43fd59",
			"beginDate": "1943",
			"defaultAlias": {
				"language": "mul",
				"name": "Bharati Bhawan",
				"primary": true,
				"sortName": "Bhawan, Bharati"
			},
			"disambiguation": null,
			"endDate": null,
			"ended": false,
			"type": "Publisher"
		}
 */

export function getPublisherBasicInfo(publisher: Record<string, unknown> | null | undefined) {
	return _.isNil(publisher) ? null :
		{
			area: _.get(publisher, 'area.name', null),
			bbid: _.get(publisher, 'bbid', null),
			beginDate: _.get(publisher, 'beginDate', null),
			defaultAlias: getDefaultAlias(publisher),
			disambiguation: _.get(publisher, 'disambiguation.comment', null),
			endDate: _.get(publisher, 'endDate', null),
			ended: _.get(publisher, 'ended', null),
			publisherType: _.get(publisher, 'publisherType.label', null)
		};
}

/**
 * getEntityAliases is a function to extract the list of aliases from ORM entity
 *
 * @param {object} entity - An ORM Entity
 * @returns {object} an object conatining the bbid and list of aliases data of an ORM entity.
 * Returns an empty array if no aliases were found
 * If entity is null or undefined, returns null.
 * @example
 *		const edition = await orm.func.entity.getEntity(orm, 'Edition', bbid, relations);
 *		getEntityAliases(edition);
 *		/* => {
			"aliases": [
				{
					"language": "eng",
					"name": "A Monster Calls",
					"primary": true,
					"sortName": "Monster Calls, A"
				}
			],
			"bbid": "442ab642-985a-4957-9d61-8a1d9e82de1f"
		}
 */

export function getEntityAliases(entity: any) {
	return _.isNil(entity) ? null :
		{
			aliases: _.get(entity, 'aliasSet.aliases', []).map((alias) => ({
				language: _.get(alias, 'language.isoCode3', null),
				name: _.get(alias, 'name', null),
				primary: _.get(alias, 'primary', null),
				sortName: _.get(alias, 'sortName', null)
			})),
			bbid: _.get(entity, 'bbid', null)
		};
}

/**
 * getEntityIdentifiers is a function to extract the list of indentifiers from an ORM entity
 *
 * @param {object} entity - An ORM entity
 * @returns {object} an object containing the bbid and list of identifier data of an entity.
 * Returns an empty array if no identifiers were found.
 * If entity object is null or undefined, returns null.
 *
 * @example
 *		const edition = await orm.func.entity.getEntity(orm, 'Edition', bbid, relations);
 *		getEntityIdentifiers(edition);
 *		/* => {
			"bbid": "442ab642-985a-4957-9d61-8a1d9e82de1f",
			"identifiers": [
				{
					"type": "Amazon ASIN",
					"value": "B00A9U9J6C"
				}
			]
		}
 */

export function getEntityIdentifiers(entity: any) {
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
 * getEntityRelationships is a function to extract the list of relationships from an ORM entity
 *
 * @param {object} entity -  An ORM entity
 * @returns {object} an object containing the bbid and list of ralationship data of an ORM entity
 * The relationships property defaults to an empty array.
 * If entity is null or undefined, returns null.
 *
 * @example
 *		const edition = await orm.func.entity.getEntity(orm, 'Edition', bbid, relations);
 *		getEntityRelationships(edition);
 *		/* => {
			"bbid": "442ab642-985a-4957-9d61-8a1d9e82de1f",
			"relationships": [
				{
					"direction": "backward",
					"id": 2643,
					"linkPhrase": "published by",
					"relationshipTypeId": 4,
					"relationshipTypeName": "Publisher",
					"targetBbid": "aeb93857-6d00-4494-9a7e-ee643dc0bf4d",
					"targetEntityType": "Publisher"
				}
			]
		}
 */

export function getEntityRelationships(entity: any) {
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
						_.kebabCase(_.get(relationship, 'type.targetEntityType', null)) :
						_.kebabCase(_.get(relationship, 'type.sourceEntityType', null))
				};
			})
		};
}

export function formatSearchResponse(searchResult?: {results:any[], total:number}) {
	const {results, total} = searchResult;
	return _.isNil(searchResult) ? null :
		{
			resultCount: results.length,
			searchResult: results.map((entity) => ({
				bbid: _.get(entity, 'bbid', null),
				defaultAlias: getDefaultAlias(entity),
				entityType: _.get(entity, 'type', null)
			})),
			totalCount: total
		};
}
