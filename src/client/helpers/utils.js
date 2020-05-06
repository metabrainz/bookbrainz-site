/*
 * Copyright (C) 2016  Daniel Hsing
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

import {Iterable} from 'immutable';
import _ from 'lodash';
import {format} from 'date-fns';

/**
 * Injects entity model object with a default alias name property.
 *
 * @param {object} instance - Entity object.
 * @returns {object} - New object with injected properties.
 */
export function injectDefaultAliasName(instance) {
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

const MILLISECONDS_PER_DAY = 86400000;

export function isWithinDayFromNow(date) {
	return Boolean(Date.now() - date.getTime() < MILLISECONDS_PER_DAY);
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
	return Iterable.isIterable(value) ? value.toJS() : value;
}

/**
 * Returns today's date as a {day, month, year} object
 * Used to check if a date is in the future
 * @function getTodayDate
 * @returns {object} today's date as a {day, month, year} object
 */
export function getTodayDate() {
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
export function ISODateStringToObject(value) {
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
		date[0] = -date[0];
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
export function isNullDate(date: Object | string) {
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
export function dateObjectToISOString(value) {
	if (_.isNil(value) || isNullDate(value)) {
		return null;
	}
	// if year is missing or not a number, return invalid date
	if ((!isNullDate(value) && (_.isNil(value.year) || value.year === '')) || !Number.isInteger(Number(value.year))) {
		return '+XXXXXX';
	}

	const isCommonEraDate = Math.sign(value.year) > -1;
	// Convert to ISO 8601:2004 extended for BCE years (±YYYYYY)
	let date = `${isCommonEraDate ? '+' : '-'}${_.padStart(Math.abs(value.year).toString(), 6, '0')}`;
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
