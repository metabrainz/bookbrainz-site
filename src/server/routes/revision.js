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

function formatChange(change, label, transformer) {
	return formatRow(
		change.kind,
		label,
		transformer(change.lhs),
		transformer(change.rhs)
	);
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

function formatDateChange(change, label) {
	return formatChange(change, label, (side) => side && [side]);
}

function formatGenderChange(change) {
	return formatChange(
		change,
		'Gender',
		(side) => side && [side.name]
	);
}

function formatEndedChange(change) {
	return [
		formatChange(
			change,
			'Ended',
			(side) => [_.isNull(side) || side ? 'Yes' : 'No']
		)
	];
}

function formatTypeChange(change, label) {
	return [
		formatChange(change, label, (side) => side && [side.label])
	];
}

function formatCreatorChange(change) {
	if (_.isEqual(change.path, ['beginDate'])) {
		return formatDateChange(change, 'Begin Date');
	}

	if (_.isEqual(change.path, ['endDate'])) {
		return formatDateChange(change, 'End Date');
	}

	if (_.isEqual(change.path, ['gender'])) {
		return formatGenderChange(change);
	}

	if (_.isEqual(change.path, ['ended'])) {
		return formatEndedChange(change);
	}

	if (_.isEqual(change.path, ['type'])) {
		return formatTypeChange(change, 'Creator Type');
	}

	return null;
}

function formatScalarChange(change, label) {
	return [formatChange(change, label, (side) => side && [side])];
}

function formatNewReleaseEventSet(change) {
	const rhs = change.rhs;
	if (rhs.releaseEvents && rhs.releaseEvents.length > 0) {
		return [formatRow(
			'N', 'Release Date', null, rhs.releaseEvents.map(
				(releaseEvent) => releaseEvent.date
			)
		)];
	}

	return [];
}

function formatReleaseEventAddOrDelete(change) {
	const lhs = change.item.lhs && [change.item.lhs.date];
	const rhs = change.item.rhs && [change.item.rhs.date];

	return [
		formatRow(change.item.kind, 'Release Date', lhs, rhs)
	];
}

function formatReleaseEventModified(change) {
	if (change.path.length > 3 && change.path[3] === 'date') {
		return [
			formatChange(
				change,
				'Release Date',
				(side) => side && [side]
			)
		];
	}

	return [];
}

function formatReleaseEvent(change) {
	const releaseEventSetAdded =
		change.kind === 'N' && _.isEqual(change.path, ['releaseEventSet']);
	if (releaseEventSetAdded) {
		return formatNewReleaseEventSet(change);
	}

	const releaseEventSetChanged =
		change.path.length > 1 && change.path[0] === 'releaseEventSet' &&
		change.path[1] === 'releaseEvents';
	if (releaseEventSetChanged) {
		if (change.kind === 'A') {
			// Release event added to or deleted from set
			return formatReleaseEventAddOrDelete(change);
		}

		if (change.kind === 'E') {
			// Entry in release event set changed
			return formatReleaseEventModified(change);
		}
	}

	return null;
}

function formatNewLanguageSet(change) {
	const rhs = change.rhs;
	if (rhs.languages && rhs.languages.length > 0) {
		return [formatRow(
			'N', 'Languages', null, rhs.languages.map(
				(language) => language.name
			)
		)];
	}

	return [];
}

function formatLanguageAddOrDelete(change) {
	const lhs = change.item.lhs && [change.item.lhs.name];
	const rhs = change.item.rhs && [change.item.rhs.name];

	return [
		formatRow(change.item.kind, `Language ${change.index}`, lhs, rhs)
	];
}

function formatLanguageModified(change) {
	if (change.path.length > 3 && change.path[3] === 'name') {
		return [
			formatChange(
				change,
				`Language ${change.path[2]}`,
				(side) => side && [side]
			)
		];
	}

	return [];
}

function formatLanguage(change) {
	const languageSetAdded =
		change.kind === 'N' && _.isEqual(change.path, ['languageSet']);
	if (languageSetAdded) {
		return formatNewLanguageSet(change);
	}

	const releaseEventSetChanged =
		change.path.length > 1 && change.path[0] === 'languageSet' &&
		change.path[1] === 'languages';
	if (releaseEventSetChanged) {
		if (change.kind === 'A') {
			// Language added to or deleted from set
			return formatLanguageAddOrDelete(change);
		}

		if (change.kind === 'E') {
			// Entry in language set changed
			return formatLanguageModified(change);
		}
	}

	return null;
}

function formatNewPublisherSet(change) {
	const rhs = change.rhs;
	if (rhs.publishers && rhs.publishers.length > 0) {
		return [formatRow(
			'N', 'Publisher', null, rhs.publishers.map(
				(publisher) => publisher.bbid
			)
		)];
	}

	return [];
}

function formatPublisherAddOrDelete(change) {
	const lhs = change.item.lhs && [change.item.lhs.bbid];
	const rhs = change.item.rhs && [change.item.rhs.bbid];

	return [
		formatRow(change.item.kind, 'Publisher', lhs, rhs)
	];
}

function formatPublisherModified(change) {
	if (change.path.length > 3 && change.path[3] === 'bbid') {
		return [
			formatChange(
				change,
				'Publisher',
				(side) => side && [side]
			)
		];
	}

	return [];
}

function formatPublisher(change) {
	const publisherSetAdded =
		change.kind === 'N' && _.isEqual(change.path, ['publisherSet']);
	if (publisherSetAdded) {
		return formatNewPublisherSet(change);
	}

	const publisherSetChanged =
		change.path.length > 1 && change.path[0] === 'publisherSet' &&
		change.path[1] === 'publishers';
	if (publisherSetChanged) {
		if (change.kind === 'A') {
			// Publisher added to or deleted from set
			return formatPublisherAddOrDelete(change);
		}

		if (change.kind === 'E') {
			// Entry in publisher set changed
			return formatPublisherModified(change);
		}
	}

	return null;
}

function formatEditionChange(change) {
	if (_.isEqual(change.path, ['publicationBbid'])) {
		return formatScalarChange(change, 'Publication');
	}

	const publisherChanged =
		_.isEqual(change.path, ['publisherSet']) ||
		_.isEqual(
			change.path.slice(0, 2), ['publisherSet', 'publishers']
		);

	if (publisherChanged) {
		return formatPublisher(change);
	}

	const releaseEventChanged =
		_.isEqual(change.path, ['releaseEventSet']) ||
		_.isEqual(
			change.path.slice(0, 2), ['releaseEventSet', 'releaseEvents']
		);

	if (releaseEventChanged) {
		return formatReleaseEvent(change);
	}

	const languageChanged =
		_.isEqual(change.path, ['languageSet']) ||
		_.isEqual(
			change.path.slice(0, 2), ['languageSet', 'languages']
		);

	if (languageChanged) {
		return formatLanguage(change);
	}

	if (_.isEqual(change.path, ['width']) ||
			_.isEqual(change.path, ['height']) ||
			_.isEqual(change.path, ['depth']) ||
			_.isEqual(change.path, ['weight'])) {
		return formatScalarChange(change, _.startCase(change.path[0]));
	}

	if (_.isEqual(change.path, ['pages'])) {
		return formatScalarChange(change, 'Page Count');
	}

	if (_.isEqual(change.path, ['editionFormat'])) {
		return formatTypeChange(change, 'Edition Format');
	}

	if (_.isEqual(change.path, ['editionStatus'])) {
		return formatTypeChange(change, 'Edition Status');
	}

	return null;
}

function formatPublisherChange(change) {
	if (_.isEqual(change.path, ['beginDate'])) {
		return formatDateChange(change, 'Begin Date');
	}

	if (_.isEqual(change.path, ['endDate'])) {
		return formatDateChange(change, 'End Date');
	}

	if (_.isEqual(change.path, ['ended'])) {
		return formatEndedChange(change);
	}

	if (_.isEqual(change.path, ['type'])) {
		return formatTypeChange(change, 'Publisher Type');
	}

	return null;
}

function formatWorkChange(change) {
	const languageChanged =
		_.isEqual(change.path, ['languageSet']) ||
		_.isEqual(
			change.path.slice(0, 2), ['languageSet', 'languages']
		);

	if (languageChanged) {
		return formatLanguage(change);
	}

	if (_.isEqual(change.path, ['type'])) {
		return formatTypeChange(change, 'Work Type');
	}

	return null;
}

function formatPublicationChange(change) {
	if (_.isEqual(change.path, ['type'])) {
		return formatTypeChange(change, 'Publication Type');
	}

	return [];
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

	function _createRevision(model) {
		return model.forge()
			.where('id', req.params.id)
			.fetchAll({withRelated: ['entity']})
			.then(diffRevisionsWithParents);
	}

	const creatorDiffsPromise = _createRevision(CreatorRevision);
	const editionDiffsPromise = _createRevision(EditionRevision);
	const publicationDiffsPromise = _createRevision(PublicationRevision);
	const publisherDiffsPromise = _createRevision(PublisherRevision);
	const workDiffsPromise = _createRevision(WorkRevision);

	Promise.join(revisionPromise, creatorDiffsPromise, editionDiffsPromise,
		workDiffsPromise, publisherDiffsPromise, publicationDiffsPromise,
		(
			revision, creatorDiffs, editionDiffs, workDiffs, publisherDiffs,
			publicationDiffs
		) => {
			const diffs = _.concat(
				formatEntityDiffs(creatorDiffs, 'Creator', formatCreatorChange),
				formatEntityDiffs(editionDiffs, 'Edition', formatEditionChange),
				formatEntityDiffs(
					publicationDiffs,
					'Publication',
					formatPublicationChange
				),
				formatEntityDiffs(
					publisherDiffs,
					'Publisher',
					formatPublisherChange
				),
				formatEntityDiffs(workDiffs, 'Work', formatWorkChange)
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
