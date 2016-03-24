/*
 * Copyright (C) 2015	Ben Ockmore
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

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const Revision = require('bookbrainz-data').Revision;
const CreatorRevision = require('bookbrainz-data').CreatorRevision;
const EditionRevision = require('bookbrainz-data').EditionRevision;
const WorkRevision = require('bookbrainz-data').WorkRevision;
const PublisherRevision = require('bookbrainz-data').PublisherRevision;
const PublicationRevision = require('bookbrainz-data').PublicationRevision;

const Promise = require('bluebird');

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const RevisionPage = React.createFactory(
	require('../../client/components/pages/revision.jsx')
);

function formatRow(kind, key, lhs, rhs) {
	if (_.isNil(lhs) && _.isNil(rhs)) {
		return [];
	}

	if (kind === 'N' || _.isNil(lhs)) {
		return {kind: 'N', key, rhs};
	}

	if (kind === 'D' || _.isNil(rhs)) {
		return {kind: 'D', key, lhs};
	}

	return {kind, key, lhs, rhs};
}

function formatNewAliasSet(entity, change) {
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

function formatAliasAddOrDelete(entity, change) {
	const lhs = change.item.lhs &&
		[`${change.item.lhs.name} (${change.item.lhs.sortName})`];
	const rhs = change.item.rhs &&
		[`${change.item.rhs.name} (${change.item.rhs.sortName})`];

	return [formatRow(change.item.kind, 'Aliases', lhs, rhs)];
}

function formatAliasModified(entity, change) {
	if (change.path.length > 3 && change.path[3] === 'name') {
		const lhs = change.lhs && [change.lhs];
		const rhs = change.rhs && [change.rhs];
		return [formatRow(
			'E', `Alias ${change.path[2]} -> Name`, lhs, rhs
		)];
	}

	if (change.path.length > 3 && change.path[3] === 'sortName') {
		const lhs = change.lhs && [change.lhs];
		const rhs = change.rhs && [change.rhs];
		return [formatRow(
			'E', `Alias ${change.path[2]} -> Sort Name`, lhs, rhs
		)];
	}

	if (change.path.length > 3 && change.path[3] === 'language') {
		const lhs = change.lhs && change.lhs.name && [change.lhs.name];
		const rhs = change.rhs && change.rhs.name && [change.rhs.name];
		return [formatRow(
			'E', `Alias ${change.path[2]} -> Language`, lhs, rhs
		)];
	}

	if (change.path.length > 3 && change.path[3] === 'primary') {
		const lhs =
			!_.isNull(change.lhs) && [change.lhs.primary ? 'Yes' : 'No'];
		const rhs =
			!_.isNull(change.rhs) && [change.rhs.primary ? 'Yes' : 'No'];
		return [formatRow(
			'E', `Alias ${change.path[2]} -> Primary`, lhs, rhs
		)];
	}

	return [];
}

function formatDefaultAliasModified(entity, change) {
	if (change.path.length > 2 && change.path[2] === 'name') {
		const lhs = change.lhs && [change.lhs];
		const rhs = change.rhs && [change.rhs];

		return [formatRow('E', 'Default Alias', lhs, rhs)];
	}

	return [];
}

function formatAlias(entity, change) {
	const aliasSetAdded =
		change.kind === 'N' && _.isEqual(change.path, ['aliasSet']);
	if (aliasSetAdded) {
		return formatNewAliasSet(entity, change);
	}

	const aliasSetChanged =
		change.path.length > 1 && change.path[0] === 'aliasSet' &&
		change.path[1] === 'aliases';
	if (aliasSetChanged) {
		if (change.kind === 'A') {
			// Alias added to or deleted from set
			return formatAliasAddOrDelete(entity, change);
		}

		if (change.kind === 'E') {
			// Entry in alias set changed
			return formatAliasModified(entity, change);
		}
	}

	const defaultAliasChanged =
		_.isEqual(change.path.slice(0, 2), ['aliasSet', 'defaultAlias']);
	if (defaultAliasChanged) {
		return formatDefaultAliasModified(entity, change);
	}
}

function formatNewIdentifierSet(entity, change) {
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

function formatIdentifierAddOrDelete(entity, change) {
	const lhs = change.item.lhs &&
		[`${change.item.lhs.type.label}: ${change.item.lhs.value}`];
	const rhs = change.item.rhs &&
		[`${change.item.rhs.type.label}: ${change.item.rhs.value}`];

	return [
		formatRow(change.item.kind, `Identifier ${change.index}`, lhs, rhs)
	];
}

function formatIdentifierModified(entity, change) {
	if (change.path.length > 3 && change.path[3] === 'value') {
		const lhs = change.lhs && [change.lhs];
		const rhs = change.rhs && [change.rhs];
		return [
			formatRow('E', `Identifier ${change.path[2]} -> Value`, lhs, rhs)
		];
	}

	if (change.path.length > 4 && change.path[3] === 'type' &&
			change.path[4] === 'label') {
		const lhs = change.lhs && [change.lhs];
		const rhs = change.rhs && [change.rhs];
		return [
			formatRow(
				'E', `Identifier ${change.path[2]} -> Type`, lhs, rhs
			)
		];
	}

	return [];
}

function formatIdentifier(entity, change) {
	const identifierSetAdded =
		change.kind === 'N' && _.isEqual(change.path, ['identifierSet']);
	if (identifierSetAdded) {
		return formatNewIdentifierSet(entity, change);
	}

	const identifierSetChanged =
		change.path.length > 1 && change.path[0] === 'identifierSet' &&
		change.path[1] === 'identifiers';
	if (identifierSetChanged) {
		if (change.kind === 'A') {
			// Identifier added to or deleted from set
			return formatIdentifierAddOrDelete(entity, change);
		}

		if (change.kind === 'E') {
			// Entry in identifier set changed
			return formatIdentifierModified(entity, change);
		}
	}
}

function formatNewAnnotation(entity, change) {
	const lhs = change.lhs;
	const rhs = change.rhs;
	return formatRow(
		change.kind, 'Annotation', [lhs && lhs.content], [rhs && rhs.content]
	);
}

function formatNewDisambiguation(entity, change) {
	const lhs = change.lhs;
	const rhs = change.rhs;
	return formatRow(
		change.kind, 'Disambiguation', [lhs && lhs.comment],
		[rhs && rhs.comment]
	);
}

function formatChangedAnnotation(entity, change) {
	const lhs = change.lhs && [change.lhs];
	const rhs = change.rhs && [change.rhs];
	return formatRow(change.kind, 'Annotation', lhs, rhs);
}

function formatChangedDisambiguation(entity, change) {
	const lhs = change.lhs && [change.lhs];
	const rhs = change.rhs && [change.rhs];
	return formatRow(change.kind, 'Disambiguation', lhs, rhs);
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
}

function formatEntityChange(entity, change) {
	const aliasChanged =
		_.isEqual(change.path, ['aliasSet']) ||
		_.isEqual(change.path.slice(0, 2), ['aliasSet', 'aliases']) ||
		_.isEqual(change.path.slice(0, 2), ['aliasSet', 'defaultAlias']);
	if (aliasChanged) {
		return formatAlias(entity, change);
	}

	const identifierChanged =
		_.isEqual(change.path, ['identifierSet']) ||
		_.isEqual(change.path.slice(0, 2), ['identifierSet', 'identifiers']);
	if (identifierChanged) {
		return formatIdentifier(entity, change);
	}

	const relationshipChanged =
		_.isEqual(change.path, ['relationshipSet', 'relationships']);
	if (relationshipChanged) {
		return formatRelationship(entity, change);
	}

	if (_.isEqual(change.path, ['annotation'])) {
		return formatNewAnnotation(entity, change);
	}

	if (_.isEqual(change.path, ['annotation', 'content'])) {
		return formatChangedAnnotation(entity, change);
	}

	if (_.isEqual(change.path, ['disambiguation'])) {
		return formatNewDisambiguation(entity, change);
	}

	if (_.isEqual(change.path, ['disambiguation', 'comment'])) {
		return formatChangedDisambiguation(entity, change);
	}

	return null;
}

function formatEntityDiffs(diffs, entitySpecificFormatter) {
	return diffs.map((diff) => {
		const formattedDiff = {
			entity: diff.entity.toJSON()
		};

		if (!diff.changes) {
			formattedDiff.changes = [];
			return formattedDiff;
		}

		const rawChangeSets = diff.changes.map((change) =>
			formatEntityChange(diff.entity, change) ||
			entitySpecificFormatter &&
			entitySpecificFormatter(diff.entity, change)
		);
		formattedDiff.changes = _.sortBy(
			_.flatten(_.compact(rawChangeSets)),
			'key'
		);
		return formattedDiff;
	});
}

function formatDateChange(entity, label, change) {
	const lhs = change.lhs && [change.lhs];
	const rhs = change.rhs && [change.rhs];
	return formatRow(change.kind, label, lhs, rhs);
}

function formatGenderChange(entity, change) {
	const lhs = change.lhs && [change.lhs.name];
	const rhs = change.rhs && [change.rhs.name];
	return formatRow(change.kind, 'Gender', lhs, rhs);
}

function formatEndedChange(entity, change) {
	const lhs = change.lhs;
	const rhs = change.rhs;
	return [
		formatRow(change.kind, 'Ended', [
			_.isNull(lhs) || lhs ? 'Yes' : 'No'
		], [
			_.isNull(rhs) || rhs ? 'Yes' : 'No'
		])
	];
}

function formatTypeChange(entity, label, change) {
	const lhs = change.lhs;
	const rhs = change.rhs;
	return [
		formatRow(change.kind, label, [lhs && lhs.label], [rhs && rhs.label])
	];
}

function formatCreatorChange(entity, change) {
	if (_.isEqual(change.path, ['beginDate'])) {
		return formatDateChange(entity, 'Begin Date', change);
	}

	if (_.isEqual(change.path, ['endDate'])) {
		return formatDateChange(entity, 'End Date', change);
	}

	if (_.isEqual(change.path, ['gender'])) {
		return formatGenderChange(entity, change);
	}

	if (_.isEqual(change.path, ['ended'])) {
		return formatEndedChange(entity, change);
	}

	if (_.isEqual(change.path, ['type'])) {
		return formatTypeChange(entity, 'Creator Type', change);
	}

	return null;
}

function formatCreatorDiffs(diffs) {
	if (!diffs) {
		return [];
	}

	const formattedDiffs = formatEntityDiffs(diffs, formatCreatorChange);

	formattedDiffs.forEach((diff) => diff.entity.type = 'Creator');
	return formattedDiffs;
}

function formatScalarChange(entity, label, change) {
	const lhs = change.lhs && [change.lhs];
	const rhs = change.rhs && [change.rhs];
	return [
		formatRow(change.kind, label, lhs, rhs)
	];
}

function formatEditionLanguages(entity, change) {
	const rhs = change.rhs;
	if (rhs && rhs.length) {
		return [formatRow(
			'N', 'Language', null, rhs.map(
				(language) => language.name
			)
		)];
	}
}

function formatEditionLanguageAddOrDelete(entity, change) {
	const lhs = change.item.lhs && [change.item.lhs.name];
	const rhs = change.item.rhs && [change.item.rhs.name];

	return [
		formatRow(change.item.kind, 'Language ${change.index}', lhs, rhs)
	];
}

function formatEditionLanguageModified(entity, change) {
	const lhs = change.lhs && [change.lhs.name];
	const rhs = change.rhs && [change.rhs.name];

	return [formatRow('E', `Language ${change.path[2]}`, lhs, rhs)];
}

function formatEditionLanguageChange(entity, change) {
	const editionLanguagesAdded =
		change.kind === 'N' && _.isEqual(change.path, ['languages']);
	if (editionLanguagesAdded) {
		return formatEditionLanguages(entity, change);
	}

	const editionLanguageChanged = change.path[0] === 'languages';
	if (editionLanguageChanged) {
		if (change.kind === 'A') {
			// Edition language added to or deleted from set
			return formatEditionLanguageAddOrDelete(entity, change);
		}

		if (change.kind === 'E') {
			// Entry in edition languages changed
			return formatEditionLanguageModified(entity, change);
		}
	}
}

function formatEditionPublishers(entity, change) {
	const rhs = change.rhs;
	if (rhs && rhs.length) {
		return [formatRow(
			'N', 'Publishers', null, rhs.map(
				(publisher) => publisher.bbid
			)
		)];
	}
}

function formatEditionPublisherAddOrDelete(entity, change) {
	const lhs = change.item.lhs && [change.item.lhs.bbid];
	const rhs = change.item.rhs && [change.item.rhs.bbid];

	return [
		formatRow(change.item.kind, 'Publisher ${change.index}', lhs, rhs)
	];
}

function formatEditionPublisherModified(entity, change) {
	const lhs = change.lhs && [change.lhs.bbid];
	const rhs = change.rhs && [change.rhs.bbid];

	return [formatRow('E', `Publisher ${change.path[2]}`, lhs, rhs)];
}

function formatEditionPublisher(entity, change) {
	const publishersAdded =
		change.kind === 'N' && _.isEqual(change.path, ['publishers']);
	if (publishersAdded) {
		return formatEditionPublishers(entity, change);
	}

	const publisherChanged = change.path[0] === 'publishers';
	if (publisherChanged) {
		if (change.kind === 'A') {
			// Publisher added to or deleted from set
			return formatEditionPublisherAddOrDelete(entity, change);
		}

		if (change.kind === 'E') {
			// Entry in publishers changed
			return formatEditionPublisherModified(entity, change);
		}
	}
}

function formatNewReleaseEvents(entity, change) {
	const rhs = change.rhs;
	if (rhs && rhs.length) {
		return formatRow(
			'N', 'Release Date', null,
			rhs.map((releaseEvent) => releaseEvent.date)
		);
	}

	return [];
}

function formatReleaseEventAddOrDelete(entity, change) {
	const lhs = change.item.lhs && [change.item.lhs.date];
	const rhs = change.item.rhs && [change.item.rhs.date];

	return [
		formatRow(change.item.kind, 'Release Date', lhs, rhs)
	];
}

function formatReleaseEventModified(entity, change) {
	const lhs = change.lhs && [change.lhs.date];
	const rhs = change.rhs && [change.rhs.date];
	return [formatRow(
		'E', `Release Date`, lhs, rhs
	)];
}

function formatReleaseEventsChange(entity, change) {
	const releaseEventsAdded =
		change.kind === 'N' && _.isEqual(change.path, ['releaseEvents']);
	if (releaseEventsAdded) {
		return formatNewReleaseEvents(entity, change);
	}

	const releaseEventsChanged = change.path[0] === 'releaseEvents';
	if (releaseEventsChanged) {
		if (change.kind === 'A') {
			// Release event added to or deleted from set
			return formatReleaseEventAddOrDelete(entity, change);
		}

		if (change.kind === 'E') {
			// Entry in release events changed
			return formatReleaseEventModified(entity, change);
		}
	}
}

function formatEditionChange(entity, change) {
	if (_.isEqual(change.path, ['publicationBbid'])) {
		return formatScalarChange(entity, 'Publication', change);
	}

	if (_.isEqual(change.path, ['publishers'])) {
		return formatEditionPublisher(entity, change);
	}

	if (_.isEqual(change.path, ['releaseEvents'])) {
		return formatReleaseEventsChange(entity, change);
	}

	if (_.isEqual(change.path, ['languages'])) {
		return formatEditionLanguageChange(entity, change);
	}

	if (_.isEqual(change.path, ['width']) ||
			_.isEqual(change.path, ['height']) ||
			_.isEqual(change.path, ['depth']) ||
			_.isEqual(change.path, ['weight'])) {
		return formatScalarChange(entity, _.startCase(change.path[0]), change);
	}

	if (_.isEqual(change.path, ['pages'])) {
		return formatScalarChange(entity, 'Page Count', change);
	}

	if (_.isEqual(change.path, ['editionFormat'])) {
		return formatTypeChange(entity, 'Edition Format', change);
	}

	if (_.isEqual(change.path, ['editionStatus'])) {
		return formatTypeChange(entity, 'Edition Status', change);
	}
}

function formatEditionDiffs(diffs) {
	if (!diffs) {
		return [];
	}

	const formattedDiffs = formatEntityDiffs(diffs, formatEditionChange);
	formattedDiffs.forEach((diff) => diff.entity.type = 'Edition');
	return formattedDiffs;
}

function formatPublisherChange(entity, change) {
	if (_.isEqual(change.path, ['beginDate'])) {
		return formatDateChange(entity, 'Begin Date', change);
	}

	if (_.isEqual(change.path, ['endDate'])) {
		return formatDateChange(entity, 'End Date', change);
	}

	if (_.isEqual(change.path, ['ended'])) {
		return formatEndedChange(entity, change);
	}

	if (_.isEqual(change.path, ['type'])) {
		return formatTypeChange(entity, 'Publisher Type', change);
	}

	return null;
}

function formatPublisherDiffs(diffs) {
	if (!diffs) {
		return [];
	}

	const formattedDiffs = formatEntityDiffs(diffs, formatPublisherChange);
	formattedDiffs.forEach((diff) => diff.entity.type = 'Publisher');
	return formattedDiffs;
}

function formatNewWorkLanguages(entity, change) {
	const rhs = change.rhs;
	if (rhs && rhs.length) {
		return [formatRow(
			'N', 'Languages', null,
			rhs.map((language) => language.name)
		)];
	}

	return [];
}

function formatWorkLanguageAddOrDelete(entity, change) {
	const lhs = change.item.lhs && [change.item.lhs.name];
	const rhs = change.item.rhs && [change.item.rhs.name];

	return [
		formatRow(change.item.kind, `Language ${change.index}`, lhs, rhs)
	];
}

function formatWorkLanguageModified(entity, change) {
	const lhs = change.lhs && [change.lhs.name];
	const rhs = change.rhs && [change.rhs.name];
	return [formatRow(
		'E', `Language ${change.path[2]}`, lhs, rhs
	)];
}

function formatWorkLanguageChange(entity, change) {
	const workLanguageSetAdded =
		change.kind === 'N' && _.isEqual(change.path, ['languages']);
	if (workLanguageSetAdded) {
		return formatNewWorkLanguages(entity, change);
	}

	const workLanguageSetChanged = change.path[0] === 'languages';
	if (workLanguageSetChanged) {
		if (change.kind === 'A') {
			// Work language added to or deleted from set
			return formatWorkLanguageAddOrDelete(entity, change);
		}

		if (change.kind === 'E') {
			// Entry in work languages changed
			return formatWorkLanguageModified(entity, change);
		}
	}
}

function formatWorkChange(entity, change) {
	const workLanguageChanged =
		_.isEqual(change.path, ['languages']);

	if (workLanguageChanged) {
		return formatWorkLanguageChange(entity, change);
	}

	if (_.isEqual(change.path, ['type'])) {
		return formatTypeChange(entity, 'Work Type', change);
	}

	return null;
}

function formatWorkDiffs(diffs) {
	if (!diffs) {
		return [];
	}

	const formattedDiffs = formatEntityDiffs(diffs, formatWorkChange);
	formattedDiffs.forEach((diff) => diff.entity.type = 'Work');
	return formattedDiffs;
}

function formatPublicationChange(entity, change) {
	if (_.isEqual(change.path, ['type'])) {
		return formatTypeChange(entity, 'Publication Type', change);
	}

	return [];
}

function formatPublicationDiffs(diffs) {
	if (!diffs) {
		return [];
	}

	const formattedDiffs = formatEntityDiffs(diffs, formatPublicationChange);
	formattedDiffs.forEach((diff) => diff.entity.type = 'Publication');
	return formattedDiffs;
}

function diffRevisionsWithParents(revisions) {
	// revisions - collection of revisions matching id
	return Promise.all(revisions.map((revision) =>
		revision.parent()
			.then((parent) =>
				Promise.props({
					changes: revision.diff(parent),
					entity: revision.related('entity')
				})
			)
	));
}

router.get('/:id', (req, res) => {
	// Here, we need to get the Revision, then get all <Entity>Revision
	// objects with the same ID, formatting each revision individually, then
	// concatenating the diffs
	const revisionPromise = new Revision({id: req.params.id})
		.fetch({withRelated: ['author', 'notes', 'notes.author']});

	const creatorDiffsPromise =
		new CreatorRevision()
			.where('id', req.params.id).fetchAll({withRelated: ['entity']})
			.then(diffRevisionsWithParents);

	const editionDiffsPromise =
		new EditionRevision()
			.where('id', req.params.id).fetchAll({withRelated: ['entity']})
			.then(diffRevisionsWithParents);

	const workDiffsPromise =
		new WorkRevision()
			.where('id', req.params.id).fetchAll({withRelated: ['entity']})
			.then(diffRevisionsWithParents);

	const publicationDiffsPromise =
		new PublicationRevision()
			.where('id', req.params.id).fetchAll({withRelated: ['entity']})
			.then(diffRevisionsWithParents);

	const publisherDiffsPromise =
		new PublisherRevision()
			.where('id', req.params.id).fetchAll({withRelated: ['entity']})
			.then(diffRevisionsWithParents);

	Promise.join(revisionPromise, creatorDiffsPromise, editionDiffsPromise,
		workDiffsPromise, publisherDiffsPromise, publicationDiffsPromise,
		(
			revision, creatorDiffs, editionDiffs, workDiffs, publisherDiffs,
			publicationDiffs
		) => {
			const diffs = _.concat(
				formatCreatorDiffs(creatorDiffs),
				formatEditionDiffs(editionDiffs),
				formatWorkDiffs(workDiffs),
				formatPublisherDiffs(publisherDiffs),
				formatPublicationDiffs(publicationDiffs)
			);

			const props = {revision: revision.toJSON(), diffs};
			res.render('page', {
				title: 'RevisionPage',
				markup: ReactDOMServer.renderToString(RevisionPage(props))
			});
		}
	);
});

module.exports = router;
