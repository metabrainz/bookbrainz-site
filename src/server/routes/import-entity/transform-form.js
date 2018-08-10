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

import _ from 'lodash';


export function constructAliases(aliasEditor, nameSection) {
	const aliases = _.map(
		aliasEditor,
		({id, language, name, primary, sortName}) => ({
			default: false,
			id,
			languageId: language,
			name,
			primary,
			sortName
		})
	);

	return [{
		default: true,
		languageId: nameSection.language,
		name: nameSection.name,
		primary: true,
		sortName: nameSection.sortName
	}, ...aliases];
}

export function constructIdentifiers(identifierEditor) {
	return _.map(identifierEditor, ({id, type, value}) => ({
		id,
		typeId: type,
		value
	}));
}

export function formToCreatorState(data) {
	const aliases = constructAliases(data.aliasEditor, data.nameSection);
	const identifiers = constructIdentifiers(data.identifierEditor);

	return {
		aliases,
		beginAreaId: data.creatorSection.beginArea &&
			data.creatorSection.beginArea.id,
		beginDate: data.creatorSection.beginDate,
		disambiguation: data.nameSection.disambiguation,
		endAreaId: data.creatorSection.endArea &&
			data.creatorSection.endArea.id,
		endDate: data.creatorSection.ended ? data.creatorSection.endDate : '',
		ended: data.creatorSection.ended,
		genderId: data.creatorSection.gender,
		identifiers,
		note: data.submissionSection.note,
		type: 'Creator',
		typeId: data.creatorSection.type
	};
}

export function formToEditionState(data) {
	const aliases = constructAliases(data.aliasEditor, data.nameSection);
	const identifiers = constructIdentifiers(data.identifierEditor);
	const languages = _.map(data.editionSection.languages, 'value');

	let releaseEvents = [];
	if (data.editionSection.releaseDate) {
		releaseEvents = [{date: data.editionSection.releaseDate}];
	}

	return {
		aliases,
		depth: data.editionSection.depth &&
			parseInt(data.editionSection.depth, 10),
		disambiguation: data.nameSection.disambiguation,
		formatId: data.editionSection.format &&
			parseInt(data.editionSection.format, 10),
		height: data.editionSection.height &&
			parseInt(data.editionSection.height, 10),
		identifiers,
		languages,
		note: data.submissionSection.note,
		pages: data.editionSection.pages &&
			parseInt(data.editionSection.pages, 10),
		publicationBbid: data.editionSection.publication &&
			data.editionSection.publication.id,
		publishers: data.editionSection.publisher &&
			[data.editionSection.publisher.id],
		releaseEvents,
		statusId: data.editionSection.status &&
			parseInt(data.editionSection.status, 10),
		type: 'Edition',
		weight: data.editionSection.weight &&
			parseInt(data.editionSection.weight, 10),
		width: data.editionSection.width &&
			parseInt(data.editionSection.width, 10)
	};
}

export function formToPublicationState(data) {
	const aliases = constructAliases(data.aliasEditor, data.nameSection);
	const identifiers = constructIdentifiers(data.identifierEditor);

	return {
		aliases,
		disambiguation: data.nameSection.disambiguation,
		identifiers,
		note: data.submissionSection.note,
		type: 'Publication',
		typeId: data.publicationSection.type
	};
}

export function formToPublisherState(data) {
	const aliases = constructAliases(data.aliasEditor, data.nameSection);
	const identifiers = constructIdentifiers(data.identifierEditor);

	return {
		aliases,
		areaId: data.publisherSection.area && data.publisherSection.area.id,
		beginDate: data.publisherSection.beginDate,
		disambiguation: data.nameSection.disambiguation,
		endDate: data.publisherSection.ended ?
			data.publisherSection.endDate : '',
		ended: data.publisherSection.ended,
		identifiers,
		note: data.submissionSection.note,
		type: 'Publisher',
		typeId: data.publisherSection.type
	};
}

export function formToWorkState(data) {
	const aliases = constructAliases(data.aliasEditor, data.nameSection);
	const identifiers = constructIdentifiers(data.identifierEditor);
	const languages = _.map(data.workSection.languages, 'value');

	return {
		aliases,
		disambiguation: data.nameSection.disambiguation,
		identifiers,
		languages,
		note: data.submissionSection.note,
		type: 'Work',
		typeId: data.workSection.type
	};
}

export const transformForm = {
	Creator: formToCreatorState,
	Edition: formToEditionState,
	Publication: formToPublicationState,
	Publisher: formToPublisherState,
	Work: formToWorkState
};
