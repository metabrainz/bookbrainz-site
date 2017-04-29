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

import * as bootstrap from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import React from 'react';
import _get from 'lodash.get';

const {Button, Table} = bootstrap;

export function extractAttribute(attr, path) {
	if (attr) {
		if (path) {
			return _get(attr, path, '?');
		}
		return attr;
	}
	return '?';
}

export function getLanguageAttribute(entity) {
	const languages = (entity.languageSet && entity.languageSet.languages) ?
		entity.languageSet.languages.map(
			(language) => language.name
		).join(', ') : '?';
	return {data: languages, title: 'Languages'};
}

export function getTypeAttribute(entityType) {
	return {data: extractAttribute(entityType, 'label'), title: 'Type'};
}

export function getDateAttributes(entity) {
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

export function showEntityEditions(entity) {
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
