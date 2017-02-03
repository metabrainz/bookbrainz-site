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
/* eslint-disable react/display-name */
const React = require('react');
const FontAwesome = require('react-fontawesome');
const Button = require('react-bootstrap').Button;
const Table = require('react-bootstrap').Table;
const _get = require('lodash.get');

function extractAttribute(attr, path) {
	'use strict';
	if (attr) {
		if (path) {
			return _get(attr, path, '?');
		}
		return attr;
	}
	return '?';
}

function getLanguageAttribute(entity) {
	'use strict';
	const languages = (entity.languageSet && entity.languageSet.languages) ?
		entity.languageSet.languages.map(
			(language) => language.name
		).join(', ') : '?';
	return {data: languages, title: 'Languages'};
}

function getTypeAttribute(entityType) {
	'use strict';
	return {data: extractAttribute(entityType, 'label'), title: 'Type'};
}

function getDateAttributes(entity) {
	'use strict';
	const attributes = [{
		data: extractAttribute(entity.beginDate),
		title: 'Begin Date'
	}];
	if (entity.ended) {
		attributes.push({
			data: extractAttribute(entity.endDate),
			title: 'End Date'
		});
	}
	return attributes;
}

function showEntityEditions(entity) {
	'use strict';
	return (
		<div>
			<h2>
				Editions
				<Button
					bsStyle="success"
					className="pull-right"
					href={`/edition/create?${
						entity.type.toLowerCase()}=${entity.bbid}`}
				>
					<FontAwesome name="plus"/>
					{'  Add Edition'}
				</Button>
			</h2>
			<Table striped>
				<thead>
				<tr>
					<th>Name</th>
					<th>Release Date</th>
				</tr>
				</thead>
				<tbody>
				{entity.editions.map((edition, idx) => {
					const editionName = edition.defaultAlias ?
						edition.defaultAlias.name : '(unnamed)';
					const editionComment = (edition.disambiguation &&
					edition.disambiguation.comment) ?
						` (${edition.disambiguation.comment})` : '';
					const releaseEventDate = (edition.releaseEventSet &&
						edition.releaseEventSet.releaseEvents &&
						edition.releaseEventSet.releaseEvents[0]) &&
						edition.releaseEventSet.releaseEvents[0].date;
					return (
						<tr
							key={`${edition.bbid}${idx}`}
						>
							<td>
								<a href={`/edition/${edition.bbid}`}>
									{editionName}
								</a>
								<span className="text-muted">
									{editionComment}
								</span>
							</td>
							<td>
								{releaseEventDate}
							</td>
						</tr>
					);
				})}
				</tbody>
			</Table>
		</div>
	);
}

exports.extractAttribute = extractAttribute;
exports.getTypeAttribute = getTypeAttribute;
exports.getDateAttributes = getDateAttributes;
exports.getLanguageAttribute = getLanguageAttribute;
exports.showEntityEditions = showEntityEditions;
