/*
 * Copyright (C) 2018 Shivam Tripathi
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

/* This module contains functions to transform importEntities to form
	sections for edit. The form sections are:
		=> aliasEditor,
		=> buttonBar,
		=> identifierEditor,
		=> nameSection,
		=> entitySection (where entity could any of the )
	These functions are used when we choose to edit and approve the
	importEntities - i.e. we need to transform the existing importEntity to
	the form layout as described in the `client/entity-editor`
*/

import _ from 'lodash';


export function areaToOption(area) {
	if (!area) {
		return null;
	}
	const {id} = area;
	return {
		disambiguation: area.comment,
		id,
		text: area.name,
		type: 'area'
	};
}

function getAliasEditor(importEntity) {
	const aliases = importEntity.aliasSet ?
		importEntity.aliasSet.aliases.map(({language, ...rest}) => ({
			language: language.id,
			...rest
		})) : [];

	const {defaultAlias} = importEntity;
	defaultAlias.language = defaultAlias.languageId;

	const aliasEditor = {};
	aliases.forEach((alias) => {
		if (alias.id !== defaultAlias.id) {
			aliasEditor[alias.id] = alias;
			aliasEditor[alias.id].default = alias.id === defaultAlias.id;
		}
	});

	return aliasEditor;
}

function getButtonBar(importEntity) {
	return {
		aliasEditorVisible: false,
		disambiguationVisible: Boolean(importEntity.disambiguation),
		identifierEditorVisible: false
	};
}

function getNameSection(importEntity) {
	const {defaultAlias, disambiguation} = importEntity;
	const nameSection = defaultAlias ? defaultAlias : {
		language: null,
		name: '',
		sortName: ''
	};

	nameSection.disambiguation =
		disambiguation && disambiguation.comment;

	return nameSection;
}

function getIdentifierEditor(importEntity) {
	const {identifierSet} = importEntity;
	const identifiers = identifierSet ?
		identifierSet.identifiers.map(({type, ...rest}) => ({
			type: type.id,
			...rest
		})) : [];

	const identifierEditor = {};
	identifiers.forEach(
		(identifier) => { identifierEditor[identifier.id] = identifier; }
	);

	return identifierEditor;
}

function getCreatorSection(creatorImport) {
	return {
		beginArea: areaToOption(creatorImport.beginArea),
		beginDate: creatorImport.beginDate,
		endArea: areaToOption(creatorImport.endArea),
		endDate: creatorImport.endDate,
		ended: creatorImport.ended,
		gender: creatorImport.gender && creatorImport.gender.id,
		type: creatorImport.creatorType && creatorImport.creatorType.id
	};
}

function getEditionSection(editionImport) {
	const physicalVisible = !(
		_.isNull(editionImport.depth) && _.isNull(editionImport.height) &&
		_.isNull(editionImport.pages) && _.isNull(editionImport.weight) &&
		_.isNull(editionImport.width)
	);

	const releaseDate = editionImport.releaseEventSet && (
		_.isEmpty(editionImport.releaseEventSet.releaseEvents) ?
			null : editionImport.releaseEventSet.releaseEvents[0].date
	);

	return {
		depth: editionImport.depth,
		format: editionImport.editionFormat && editionImport.editionFormat.id,
		height: editionImport.height,
		languages:
			editionImport.languageSet ?
				editionImport.languageSet.languages.map(
					({id, name}) => ({label: name, value: id})
				) : [],
		pages: editionImport.pages,
		physicalVisible,
		releaseDate,
		status: editionImport.editionStatus && editionImport.editionStatus.id,
		weight: editionImport.weight,
		width: editionImport.width
	};
}

function getPublicationSection(publicationImport) {
	const {publicationType} = publicationImport;
	return {
		type: publicationType && publicationType.id
	};
}

function getPublisherSection(publisherImport) {
	return {
		area: areaToOption(publisherImport.area),
		beginDate: publisherImport.beginDate,
		endDate: publisherImport.endDate,
		ended: publisherImport.ended,
		type: publisherImport.publisherType && publisherImport.publisherType.id
	};
}

function getWorkSection(workImport) {
	return {
		languages:
			workImport.languageSet ? workImport.languageSet.languages.map(
				({id, name}) => ({label: name, value: id})
			) : [],
		type: workImport.workType && workImport.workType.id
	};
}

export const entitySectionMap = {
	Creator: getCreatorSection,
	Edition: getEditionSection,
	Publication: getPublicationSection,
	Publisher: getPublisherSection,
	Work: getWorkSection
};

export function entityToFormState(importEntity) {
	const entitySection = `${importEntity.type.toLowerCase()}Section`;
	return {
		aliasEditor: getAliasEditor(importEntity),
		buttonBar: getButtonBar(importEntity),
		[entitySection]: entitySectionMap[importEntity.type](importEntity),
		identifierEditor: getIdentifierEditor(importEntity),
		nameSection: getNameSection(importEntity)
	};
}
