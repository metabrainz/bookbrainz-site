/*
 * Copyright (C) 2016  Daniel Hsing
 *               2021  Akash Gupta
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

import {faBarcode, faLink, faPlus} from '@fortawesome/free-solid-svg-icons';
import AuthorTable from '../components/pages/entities/author-table';
import DOMPurify from 'isomorphic-dompurify';
import EditionGroupTable from '../components/pages/entities/editionGroup-table';
import EditionTable from '../components/pages/entities/edition-table';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PublisherTable from '../components/pages/entities/publisher-table';
import React from 'react';
import SeriesTable from '../components/pages/entities/series-table';
import WorkTable from '../components/pages/entities/work-table';
import _ from 'lodash';
import {format} from 'date-fns';
import {isIterable} from '../../types';


export interface DateObject {
	day: string | null;
	month: string | null;
	year: string | null;
}


/**
 * Injects entity model object with a default alias name property.
 *
 * @param {object} instance - Entity object.
 * @returns {object} - New object with injected properties.
 */
export function injectDefaultAliasName(instance: Record<string, any>) {
	if (instance && instance.name) {
		return Object.assign({}, instance, {
			defaultAlias: {
				name: instance.name
			}
		});
	}
	return instance;
}

export function formatDate(date, includeTime) {
	if (!date) {
		return null;
	}

	if (includeTime) {
		return format(date, 'yyyy-MM-dd HH:mm:ss');
	}
	return format(date, 'yyyy-MM-dd');
}

export function labelsForAuthor(isGroup) {
	return {
		beginAreaLabel: isGroup ? 'Place founded' : 'Place of birth',
		beginDateLabel: isGroup ? 'Date founded' : 'Date of birth',
		endAreaLabel: isGroup ? 'Place of dissolution' : 'Place of death',
		endDateLabel: isGroup ? 'Date of dissolution' : 'Date of death',
		endedLabel: isGroup ? 'Dissolved?' : 'Died?'
	};
}

export function convertMapToObject(value) {
	return isIterable(value) ? value.toJS() : value;
}

/**
 * Returns today's date as a {day, month, year} object
 * Used to check if a date is in the future
 * @function getTodayDate
 * @returns {object} today's date as a {day, month, year} object
 */
export function getTodayDate(): DateObject {
	const date = new Date();
	const year = date.getFullYear().toString();
	const month = (date.getMonth() + 1).toString();
	const day = date.getDate().toString();
	return {day, month, year};
}

/**
 * Parse an ISO 8601-2004 string and return an object with separate day, month and year, if they exist.
 * If any of the values don't exist, the default is an empty string.
 * @function ISODateStringToObject
 * @param {string} value - relationshipId number for initaial relationship
 * @returns {object} a {day, month, year} object
 */
export function ISODateStringToObject(value: string | DateObject): DateObject {
	if (!_.isString(value)) {
		if (_.isPlainObject(value) && _.has(value, 'year')) {
			return value;
		}
		return {day: '', month: '', year: ''};
	}
	const date = value ? value.split('-') : [];
	// A leading minus sign denotes a BC date
	// This creates an empty first array item that needs to be removed,
	// and requires us to add the negative sign back for the year
	if (date.length && date[0] === '') {
		date.shift();
		date[0] = (-parseInt(date[0], 10)).toString();
	}
	return {
		day: date.length > 2 ? date[2] : '',
		month: date.length > 1 ? date[1] : '',
		year: date.length > 0 ? date[0] : ''
	};
}

/**
 * Determines wether a given date is empty or null, meaning no year month or day has been specified.
 * Accepts a {day, month, year} object or an ISO 8601-2004 string (±YYYYYY-MM-DD)
 * @function isNullDate
 * @param {object|string} date - a {day, month, year} object or ISO 8601-2004 string (±YYYYYY-MM-DD)
 * @returns {boolean} true if the date is empty/null
 */
export function isNullDate(date: string | DateObject): boolean {
	const dateObject = ISODateStringToObject(date);
	const isNullYear = _.isNil(dateObject.year) || dateObject.year === '';
	const isNullMonth = _.isNil(dateObject.month) || dateObject.month === '';
	const isNullDay = _.isNil(dateObject.day) || dateObject.day === '';
	return isNullYear && isNullMonth && isNullDay;
}


/**
 * Format a {day, month, year} object into an ISO 8601-2004 string (±YYYYYY-MM-DD)
 * @function dateObjectToISOString
 * @param {string} value - a {day, month, year} object
 * @returns {string} ISO 8601-2004 string (±YYYYYY-MM-DD)
 */
export function dateObjectToISOString(value: DateObject) {
	if (_.isNil(value) || isNullDate(value)) {
		return null;
	}
	// if year is missing or not a number, return invalid date
	if ((!isNullDate(value) && (_.isNil(value.year) || value.year === '')) || !Number.isInteger(Number(value.year))) {
		return '+XXXXXX';
	}

	const numericYear = parseInt(value.year, 10);

	const isCommonEraDate = Math.sign(numericYear) > -1;
	// Convert to ISO 8601:2004 extended for BCE years (±YYYYYY)
	let date = `${isCommonEraDate ? '+' : '-'}${_.padStart(Math.abs(numericYear).toString(), 6, '0')}`;
	if (value.month) {
		date += `-${value.month}`;
		if (value.day) {
			date += `-${value.day}`;
		}
	}
	else if (value.day) {
		date += `-XX-${value.day}`;
	}
	return date;
}

/**
 * Find the first index of an unbalanced paranthesis in a url string.
 * @function firstIndexOfUnbalancedParanthesis
 * @param {string} url - URL string.
 * @returns {number} idx - index of the first unbalanced parathesis. If no unbalanced paranthesis found, returns -1
 */
function firstIndexOfUnbalancedParanthesis(url: string): number {
	let cnt = 0;
	for (let i = 0; i <= url.length; i++) {
		if (url[i] === '(') {
			cnt += 1;
		}
		else if (url[i] === ')') {
			cnt -= 1;
		}
		if (cnt < 0) {
			return i;
		}
	}
	return -1;
}

/**
 * Convert any string url that has a prefix http|https|ftp|ftps to a clickable link
 * and then rendered the HTML string as real HTML.
 * @function stringToHTMLWithLinks
 * @param {string} content - Can be either revision notes or annotation content etc...
 * @returns {JSX} returns a JSX Element
 */
export function stringToHTMLWithLinks(content: string) {
	// eslint-disable-next-line max-len, no-useless-escape
	const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;
	const replacedContent = content.replace(
		urlRegex,
		(url) => {
			let cleanUrl: string = url;
			let suffix = '';
			const firstUnbalancedParanthesis = firstIndexOfUnbalancedParanthesis(url);
			if (firstUnbalancedParanthesis !== -1) {
				cleanUrl = url.substring(0, firstUnbalancedParanthesis);
				suffix = url.substring(firstUnbalancedParanthesis);
			}
			let link = `<a href="${cleanUrl.startsWith('www.') ? `https://${cleanUrl}` : cleanUrl}" target="_blank">${cleanUrl}</a>`;
			return link + suffix;
		}
	);
	const sanitizedHtml = DOMPurify.sanitize(replacedContent, {ADD_ATTR: ['target']});
	// eslint-disable-next-line react/no-danger
	return <span dangerouslySetInnerHTML={{__html: sanitizedHtml}}/>;
}

/**
 * Returns EntityTable associated with the entity type.
 * @function getEntityTable
 * @param {string} entityType - Entity Type (author, work, series etc ...)
 * @returns {JSX} returns EntityTable Component
 */
export function getEntityTable(entityType: string) {
	const tables = {
		Author: AuthorTable,
		Edition: EditionTable,
		EditionGroup: EditionGroupTable,
		Publisher: PublisherTable,
		Series: SeriesTable,
		Work: WorkTable
	};
	return tables[entityType];
}

export function getEntityKey(entityType:string) {
	const keys = {
		Author: 'authors',
		Edition: 'editions',
		EditionGroup: 'editionGroups',
		Publisher: 'publishers',
		Series: 'series',
		Work: 'works'
	};
	return keys[entityType];
}

export function countWords(text: string) : number {
	// Credit goes to iamwhitebox https://stackoverflow.com/a/39125279/14911205
	const words = text.match(/\w+/g);
	if (words === null) {
		return 0;
	}
	return words.length;
}

export const RelationshipTypeEditorIcon = (
	<span className="fa-layers fa-fw margin-right-0-3">
		<FontAwesomeIcon icon={faLink} transform="left-3"/>
		<FontAwesomeIcon icon={faPlus} transform="shrink-8 right-5 down-5"/>
	</span>
);

export const IdentifierTypeEditorIcon = (
	<span className="fa-layers fa-fw margin-right-0-3">
		<FontAwesomeIcon icon={faBarcode} transform="shrink-3 left-5"/>
		<FontAwesomeIcon icon={faPlus} transform="shrink-8 right-5 down-2"/>
	</span>
);
