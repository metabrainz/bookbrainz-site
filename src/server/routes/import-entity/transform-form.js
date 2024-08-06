/*
 * Copyright (C) 2017 Ben Ockmore
 *               2018 Shivam Tripathi
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

import {constructAliases, constructIdentifiers} from '../entity/entity';
import {map} from 'lodash';


export function formToAuthorState(data) {
	const aliases = constructAliases(data.aliasEditor, data.nameSection);
	const identifiers = constructIdentifiers(data.identifierEditor);

	return {
		aliases,
		annotation: data.annotationSection.content,
		beginAreaId: data.authorSection.beginArea &&
			data.authorSection.beginArea.id,
		beginDate: data.authorSection.beginDate,
		disambiguation: data.nameSection.disambiguation,
		endAreaId: data.authorSection.endArea &&
			data.authorSection.endArea.id,
		endDate: data.authorSection.ended ? data.authorSection.endDate : '',
		ended: data.authorSection.ended,
		genderId: data.authorSection.gender,
		identifiers,
		note: data.submissionSection.note,
		type: 'Author',
		typeId: data.authorSection.type
	};
}

export function formToEditionState(data) {
	const aliases = constructAliases(data.aliasEditor, data.nameSection);
	const identifiers = constructIdentifiers(data.identifierEditor);
	const languages = map(data.editionSection.languages, 'value');

	let releaseEvents = [];
	if (data.editionSection.releaseDate) {
		releaseEvents = [{date: data.editionSection.releaseDate}];
	}

	return {
		aliases,
		annotation: data.annotationSection.content,
		depth: data.editionSection.depth &&
			parseInt(data.editionSection.depth, 10),
		disambiguation: data.nameSection.disambiguation,
		editionGroupBbid: data.editionSection.editionGroup &&
			data.editionSection.editionGroup.id,
		formatId: data.editionSection.format &&
			parseInt(data.editionSection.format, 10),
		height: data.editionSection.height &&
			parseInt(data.editionSection.height, 10),
		identifiers,
		languages,
		note: data.submissionSection.note,
		pages: data.editionSection.pages &&
			parseInt(data.editionSection.pages, 10),
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

export function formToEditionGroupState(data) {
	const aliases = constructAliases(data.aliasEditor, data.nameSection);
	const identifiers = constructIdentifiers(data.identifierEditor);

	return {
		aliases,
		annotation: data.annotationSection.content,
		disambiguation: data.nameSection.disambiguation,
		identifiers,
		note: data.submissionSection.note,
		type: 'EditionGroup',
		typeId: data.editionGroupSection.type
	};
}

export function formToPublisherState(data) {
	const aliases = constructAliases(data.aliasEditor, data.nameSection);
	const identifiers = constructIdentifiers(data.identifierEditor);

	return {
		aliases,
		annotation: data.annotationSection.content,
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
	const languages = map(data.workSection.languages, 'value');

	return {
		aliases,
		annotation: data.annotationSection.content,
		disambiguation: data.nameSection.disambiguation,
		identifiers,
		languages,
		note: data.submissionSection.note,
		type: 'Work',
		typeId: data.workSection.type
	};
}

export const transformForm = {
	Author: formToAuthorState,
	Edition: formToEditionState,
	EditionGroup: formToEditionGroupState,
	Publisher: formToPublisherState,
	Work: formToWorkState
};
