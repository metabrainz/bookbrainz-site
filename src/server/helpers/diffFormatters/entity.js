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

import * as base from './base';

import _ from 'lodash';


function formatNewAnnotation(change) {
	return base.formatChange(
		change, 'Annotation', (side) => [side && side.content]
	);
}

function formatNewDisambiguation(change) {
	return base.formatChange(
		change, 'Disambiguation', (side) => [side && side.comment]
	);
}

function formatChangedAnnotation(change) {
	return base.formatChange(change, 'Annotation', (side) => side && [side]);
}

function formatChangedDisambiguation(change) {
	return base.formatChange(
		change, 'Disambiguation', (side) => side && [side]
	);
}

function formatNewAliasSet(change) {
	const {rhs} = change;
	const changes = [];
	if (rhs.defaultAlias && rhs.defaultAliasId) {
		changes.push(
			base.formatRow('N', 'Default Alias', null, [rhs.defaultAlias.name])
		);
	}

	if (rhs.aliases && rhs.aliases.length) {
		changes.push(
			base.formatRow(
				'N', 'Aliases', null, rhs.aliases.map((alias) => alias.name)
			)
		);
	}

	return changes;
}

function formatAliasAddOrDelete(change) {
	return [
		base.formatChange(
			change.item,
			'Aliases',
			(side) => side && [`${side.name} (${side.sortName})`]
		)
	];
}

function formatAliasModified(change) {
	if (change.path.length > 3 && change.path[3] === 'name') {
		return [
			base.formatChange(
				change,
				`Alias ${change.path[2]} -> Name`,
				(side) => side && [side]
			)
		];
	}

	if (change.path.length > 3 && change.path[3] === 'sortName') {
		return [
			base.formatChange(
				change,
				`Alias ${change.path[2]} -> Sort Name`,
				(side) => side && [side]
			)
		];
	}

	const REQUIRED_DEPTH = 4;
	const aliasLanguageChanged =
		change.path.length >= REQUIRED_DEPTH && change.path[3] === 'language' &&
		change.path[4] === 'name';
	if (aliasLanguageChanged) {
		return [
			base.formatChange(
				change,
				`Alias ${change.path[2]} -> Language`,
				(side) => side && [side]
			)
		];
	}

	if (change.path.length >= 3 && change.path[3] === 'primary') {
		return [
			base.formatChange(
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
			base.formatChange(change, 'Default Alias', (side) => side && [side])
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
	const {rhs} = change;
	if (rhs.identifiers && rhs.identifiers.length > 0) {
		return [base.formatRow(
			'N', 'Identifiers', null, rhs.identifiers.map(
				(identifier) => `${identifier.type && identifier.type.label}: ${identifier.value}`
			)
		)];
	}

	return [];
}

function formatIdentifierAddOrDelete(change) {
	return [
		base.formatChange(
			change.item,
			`Identifier ${change.index}`,
			(side) => side && [`${side.type.label}: ${side.value}`]
		)
	];
}

function formatIdentifierModified(change) {
	if (change.path.length > 3 && change.path[3] === 'value') {
		return [
			base.formatChange(
				change,
				`Identifier ${change.path[2]} -> Value`,
				(side) => side && [side]
			)
		];
	}

	const REQUIRED_DEPTH = 4;
	if (change.path.length > REQUIRED_DEPTH && change.path[3] === 'type' &&
			change.path[4] === 'label') {
		return [
			base.formatChange(
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
	const {rhs} = change.item;

	if (!rhs) {
		return changes;
	}
	const key = rhs.type && rhs.type.label ? `Relationship : ${rhs.type.label}` : 'Relationship';
	if (rhs.sourceBbid === entity.get('bbid')) {
		changes.push(
			base.formatRow(
				'N', key, null, [rhs.targetBbid]
			)
		);
	}
	else {
		changes.push(
			base.formatRow(
				'N', key, null, [rhs.sourceBbid]
			)
		);
	}
	return changes;
}

function formatAddOrDeleteRelationshipSet(entity, change) {
	const changes = [];
	let allRelationships;
	if (change.kind === 'N') {
		allRelationships = change.rhs.relationships;
	}
	if (change.kind === 'D') {
		allRelationships = change.lhs.relationships;
	}
	if (!allRelationships) {
		return changes;
	}

	allRelationships.forEach((relationship) => {
		const key = relationship.type && relationship.type.label ? `Relationship: ${relationship.type.label}` : 'Relationship';
		if (relationship.sourceBbid === entity.get('bbid')) {
			changes.push(
				base.formatRow(
					change.kind, key, [relationship.targetBbid], [relationship.targetBbid]
				)
			);
		}
		else {
			changes.push(
				base.formatRow(
					change.kind, key, [relationship.sourceBbid], [relationship.sourceBbid]
				)
			);
		}
	});
	return changes;
}

function formatRelationshipRemove(entity, change) {
	const changes = [];
	const {lhs} = change.item;

	if (!lhs) {
		return changes;
	}
	const key = lhs.type && lhs.type.label ? `Relationship : ${lhs.type.label}` : 'Relationship';
	if (lhs.sourceBbid === entity.get('bbid')) {
		changes.push(
			base.formatRow(
				'D', key, [lhs.targetBbid], null
			)
		);
	}
	else {
		changes.push(
			base.formatRow(
				'D', key, [lhs.sourceBbid], null
			)
		);
	}
	return changes;
}
function formatRelationship(entity, change) {
	if (change.kind === 'N') {
		return formatAddOrDeleteRelationshipSet(entity, change);
	}
	if (change.kind === 'A') {
		if (change.item.kind === 'N') {
			return formatRelationshipAdd(entity, change);
		}
		if (change.item.kind === 'D') {
			return formatRelationshipRemove(entity, change);
		}
	}
	if (change.kind === 'D') {
		return formatAddOrDeleteRelationshipSet(entity, change);
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
		_.isEqual(change.path, ['relationshipSet']) ||
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

export function formatEntityDiffs(diffs, entityType, entityFormatter) {
	if (!diffs) {
		return [];
	}

	return _.flatten(diffs).map((diff) => {
		const formattedDiff = {
			entity: diff.entity.toJSON(),
			isDeletion: diff.isDeletion,
			isNew: diff.isNew
		};

		formattedDiff.entity.type = entityType;
		formattedDiff.entityRevision = diff.revision && diff.revision.toJSON();

		if (diff.entityAlias) {
			// In the revision route, we fetch an entity's data to show its alias; an ORM model is returned.
			// For entities without data (deleted or merged), we use getEntityParentAlias instead which returns a JSON object
			if (typeof diff.entityAlias.toJSON === 'function') {
				const aliasJSON = diff.entityAlias.toJSON();
				if (diff.isEntityDeleted) {
					formattedDiff.entity.parentAlias = aliasJSON.aliasSet.defaultAlias;
				}
				else {
					formattedDiff.entity.defaultAlias = aliasJSON.aliasSet.defaultAlias;
				}
			}
			else if (diff.isEntityDeleted) {
				formattedDiff.entity.parentAlias = diff.entityAlias;
			}
			else {
				formattedDiff.entity.defaultAlias = diff.entityAlias;
			}
		}

		if (!diff.changes) {
			formattedDiff.changes = [];

			return formattedDiff;
		}

		const rawChangeSets = diff.changes.map(
			(change) =>
				formatEntityChange(diff.entity, change) || (
					entityFormatter && entityFormatter(change)
				)
		);

		formattedDiff.changes = _.sortBy(
			_.flatten(_.compact(rawChangeSets)),
			'key'
		);

		return formattedDiff;
	});
}
