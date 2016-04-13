/*
 * Copyright (C) 2016  Ben Ockmore
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

'use strict';

const _ = require('lodash');

const formatRow = require('./base').formatRow;
const formatChange = require('./base').formatChange;

function formatNewAnnotation(change) {
	return formatChange(change, 'Annotation', (side) => [side && side.content]);
}

function formatNewDisambiguation(change) {
	return formatChange(
		change, 'Disambiguation', (side) => [side && side.comment]
	);
}

function formatChangedAnnotation(change) {
	return formatChange(change, 'Annotation', (side) => side && [side]);
}

function formatChangedDisambiguation(change) {
	return formatChange(change, 'Disambiguation', (side) => side && [side]);
}

function formatNewAliasSet(change) {
	const rhs = change.rhs;
	const changes = [];
	if (rhs.defaultAlias && rhs.defaultAliasId) {
		changes.push(
			formatRow('N', 'Default Alias', null, [rhs.defaultAlias.name])
		);
	}

	if (rhs.aliases && rhs.aliases.length) {
		changes.push(
			formatRow(
				'N', 'Aliases', null, rhs.aliases.map((alias) => alias.name)
			)
		);
	}

	return changes;
}

function formatAliasAddOrDelete(change) {
	const lhs = change.item.lhs &&
		[`${change.item.lhs.name} (${change.item.lhs.sortName})`];
	const rhs = change.item.rhs &&
		[`${change.item.rhs.name} (${change.item.rhs.sortName})`];

	return [formatRow(change.item.kind, 'Aliases', lhs, rhs)];
}

function formatAliasModified(change) {
	if (change.path.length > 3 && change.path[3] === 'name') {
		return [
			formatChange(
				change,
				`Alias ${change.path[2]} -> Name`,
				(side) => side && [side]
			)
		];
	}

	if (change.path.length > 3 && change.path[3] === 'sortName') {
		return [
			formatChange(
				change,
				`Alias ${change.path[2]} -> Sort Name`,
				(side) => side && [side]
			)
		];
	}

	if (change.path.length > 3 && change.path[3] === 'language') {
		return [
			formatChange(
				change,
				`Alias ${change.path[2]} -> Language`,
				(side) => side && side.name && [side.name]
			)
		];
	}

	if (change.path.length > 3 && change.path[3] === 'primary') {
		return [
			formatChange(
				change,
				`Alias ${change.path[2]} -> Primary`,
				(side) => !_.isNull(side) && [side.primary ? 'Yes' : 'No']
			)
		];
	}

	return [];
}

function formatDefaultAliasModified(change) {
	if (change.path.length > 2 && change.path[2] === 'name') {
		return [
			formatChange(change, 'Default Alias', (side) => side && [side])
		];
	}

	return [];
}

function formatAlias(change) {
	const aliasSetAdded =
		change.kind === 'N' && _.isEqual(change.path, ['aliasSet']);
	if (aliasSetAdded) {
		return formatNewAliasSet(change);
	}

	const aliasSetChanged =
		change.path.length > 1 && change.path[0] === 'aliasSet' &&
		change.path[1] === 'aliases';
	if (aliasSetChanged) {
		if (change.kind === 'A') {
			// Alias added to or deleted from set
			return formatAliasAddOrDelete(change);
		}

		if (change.kind === 'E') {
			// Entry in alias set changed
			return formatAliasModified(change);
		}
	}

	const defaultAliasChanged =
		_.isEqual(change.path.slice(0, 2), ['aliasSet', 'defaultAlias']);
	if (defaultAliasChanged) {
		return formatDefaultAliasModified(change);
	}

	return null;
}

function formatNewIdentifierSet(change) {
	const rhs = change.rhs;
	if (rhs.identifiers && rhs.identifiers.length > 0) {
		return [formatRow(
			'N', 'Identifiers', null, rhs.identifiers.map(
				(identifier) => `${identifier.type.label}: ${identifier.value}`
			)
		)];
	}

	return [];
}

function formatIdentifierAddOrDelete(change) {
	const lhs = change.item.lhs &&
		[`${change.item.lhs.type.label}: ${change.item.lhs.value}`];
	const rhs = change.item.rhs &&
		[`${change.item.rhs.type.label}: ${change.item.rhs.value}`];

	return [
		formatRow(change.item.kind, `Identifier ${change.index}`, lhs, rhs)
	];
}

function formatIdentifierModified(change) {
	if (change.path.length > 3 && change.path[3] === 'value') {
		return [
			formatChange(
				change,
				`Identifier ${change.path[2]} -> Value`,
				(side) => side && [side]
			)
		];
	}

	if (change.path.length > 4 && change.path[3] === 'type' &&
			change.path[4] === 'label') {
		return [
			formatChange(
				change,
				`Identifier ${change.path[2]} -> Type`,
				(side) => side && [side]
			)
		];
	}

	return [];
}

function formatIdentifier(change) {
	const identifierSetAdded =
		change.kind === 'N' && _.isEqual(change.path, ['identifierSet']);
	if (identifierSetAdded) {
		return formatNewIdentifierSet(change);
	}

	const identifierSetChanged =
		change.path.length > 1 && change.path[0] === 'identifierSet' &&
		change.path[1] === 'identifiers';
	if (identifierSetChanged) {
		if (change.kind === 'A') {
			// Identifier added to or deleted from set
			return formatIdentifierAddOrDelete(change);
		}

		if (change.kind === 'E') {
			// Entry in identifier set changed
			return formatIdentifierModified(change);
		}
	}

	return null;
}

function formatRelationshipAdd(entity, change) {
	const changes = [];
	const rhs = change.item.rhs;

	if (!rhs) {
		return changes;
	}

	if (rhs.sourceBbid === entity.get('bbid')) {
		changes.push(
			formatRow('N', 'Relationship Source Entity', null, [rhs.sourceBbid])
		);
	}
	else {
		changes.push(
			formatRow('N', 'Relationship Target Entity', null, [rhs.targetBbid])
		);
	}

	if (rhs.type && rhs.type.label) {
		changes.push(
			formatRow('N', 'Relationship Type', null, [rhs.type.label])
		);
	}

	return changes;
}

function formatRelationship(entity, change) {
	if (change.kind === 'A') {
		if (change.item.kind === 'N') {
			return formatRelationshipAdd(entity, change);
		}
	}

	return null;
}

function formatEntityChange(entity, change) {
	const aliasChanged =
		_.isEqual(change.path, ['aliasSet']) ||
		_.isEqual(change.path.slice(0, 2), ['aliasSet', 'aliases']) ||
		_.isEqual(change.path.slice(0, 2), ['aliasSet', 'defaultAlias']);
	if (aliasChanged) {
		return formatAlias(change);
	}

	const identifierChanged =
		_.isEqual(change.path, ['identifierSet']) ||
		_.isEqual(change.path.slice(0, 2), ['identifierSet', 'identifiers']);
	if (identifierChanged) {
		return formatIdentifier(change);
	}

	const relationshipChanged =
		_.isEqual(change.path, ['relationshipSet', 'relationships']);
	if (relationshipChanged) {
		return formatRelationship(entity, change);
	}

	if (_.isEqual(change.path, ['annotation'])) {
		return formatNewAnnotation(change);
	}

	if (_.isEqual(change.path, ['annotation', 'content'])) {
		return formatChangedAnnotation(change);
	}

	if (_.isEqual(change.path, ['disambiguation'])) {
		return formatNewDisambiguation(change);
	}

	if (_.isEqual(change.path, ['disambiguation', 'comment'])) {
		return formatChangedDisambiguation(change);
	}

	return null;
}

function formatEntityDiffs(diffs, entityType, entityFormatter) {
	if (!diffs) {
		return [];
	}

	return diffs.map((diff) => {
		const formattedDiff = {
			entity: diff.entity.toJSON()
		};

		formattedDiff.entity.type = entityType;

		if (!diff.changes) {
			formattedDiff.changes = [];

			return formattedDiff;
		}

		const rawChangeSets = diff.changes.map((change) =>
			formatEntityChange(diff.entity, change) ||
			entityFormatter &&
			entityFormatter(change)
		);

		formattedDiff.changes = _.sortBy(
			_.flatten(_.compact(rawChangeSets)),
			'key'
		);

		return formattedDiff;
	});
}
module.exports.formatEntityDiffs = formatEntityDiffs;
