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
const Revision = require('../data/properties/revision');
const User = require('../data/user');
const _ = require('underscore');

function formatPairAttributeSingle(pair, attribute) {
	if (attribute) {
		return [
			pair[0] ? [pair[0][attribute]] : null,
			pair[1] ? [pair[1][attribute]] : null
		];
	}

	return [
		pair[0] ? [pair[0]] : null,
		pair[1] ? [pair[1]] : null
	];
}

function formatRelationshipDiff(revision) {
	return revision.changes.map((pair) => {
		const result = {};

		if (pair.entities) {
			result.Entities = [
				pair.entities[0].map((entity) => entity.entity.entity_gid),
				pair.entities[1].map((entity) => entity.entity.entity_gid)
			];
		}

		if (pair.texts) {
			result.Texts = [
				_.pluck(pair.texts[0], 'text'),
				_.pluck(pair.texts[1], 'text')
			];
		}

		if (pair.relationship_type) {
			result['Relationship Type'] =
				formatPairAttributeSingle(pair.relationship_type, 'label');
		}

		return result;
	});
}

function formatEntityDiff(pair) {
	const result = {};

	if (pair.annotation) {
		result.Annotation =
			formatPairAttributeSingle(pair.annotation, 'content');
	}

	if (pair.disambiguation) {
		result.Disambiguation =
			formatPairAttributeSingle(pair.disambiguation, 'comment');
	}

	if (pair.default_alias) {
		result['Default Alias'] =
			formatPairAttributeSingle(pair.default_alias, 'name');
	}

	if (pair.aliases) {
		result.Aliases = [
			_.pluck(pair.aliases[0], 'name'),
			_.pluck(pair.aliases[1], 'name')
		];
	}

	if (pair.identifiers) {
		result.Identifiers = [
			pair.identifiers[0].map((identifier) =>
				`${identifier.identifier_type.label}: ${identifier.value}`
			),
			pair.identifiers[1].map((identifier) =>
				`${identifier.identifier_type.label}: ${identifier.value}`
			)
		];
	}

	return result;
}

function formatPublicationDiff(revision) {
	return revision.changes.map((pair) => {
		const result = formatEntityDiff(pair);

		if (pair.publication_type) {
			result['Publication Type'] =
				formatPairAttributeSingle(pair.publication_type, 'label');
		}

		return result;
	});
}

function formatCreatorDiff(revision) {
	return revision.changes.map((pair) => {
		const result = formatEntityDiff(pair);

		if (pair.begin_date) {
			result['Begin Date'] = formatPairAttributeSingle(pair.begin_date);
		}

		if (pair.end_date) {
			result['End Date'] = formatPairAttributeSingle(pair.end_date);
		}

		if (pair.ended) {
			result.Ended = formatPairAttributeSingle(pair.ended);
		}

		if (pair.gender) {
			result.Gender = formatPairAttributeSingle(pair.gender, 'name');
		}

		if (pair.creator_type) {
			result['Creator Type'] =
				formatPairAttributeSingle(pair.creator_type, 'label');
		}

		return result;
	});
}

function formatEditionDiff(revision) {
	return revision.changes.map((pair) => {
		const result = formatEntityDiff(pair);

		if (pair.release_date) {
			result['Release Date'] =
				formatPairAttributeSingle(pair.release_date);
		}

		if (pair.pages) {
			result['Page Count'] =
				formatPairAttributeSingle(pair.pages);
		}

		if (pair.width) {
			result.Width =
				formatPairAttributeSingle(pair.width);
		}

		if (pair.height) {
			result.Height =
				formatPairAttributeSingle(pair.height);
		}

		if (pair.depth) {
			result.Depth =
				formatPairAttributeSingle(pair.depth);
		}

		if (pair.weight) {
			result.Weight =
				formatPairAttributeSingle(pair.weight);
		}

		if (pair.edition_format) {
			result['Edition Format'] =
				formatPairAttributeSingle(pair.edition_format, 'label');
		}

		if (pair.edition_status) {
			result['Edition Status'] =
				formatPairAttributeSingle(pair.edition_status, 'label');
		}

		if (pair.language) {
			result.Language =
				formatPairAttributeSingle(pair.language, 'name');
		}

		if (pair.publication) {
			result.Publication =
				formatPairAttributeSingle(pair.publication, 'entity_gid');
		}

		if (pair.publisher) {
			result.Publisher =
				formatPairAttributeSingle(pair.publisher, 'entity_gid');
		}

		return result;
	});
}

function formatPublisherDiff(revision) {
	return revision.changes.map((pair) => {
		const result = formatEntityDiff(pair);

		if (pair.begin_date) {
			result['Begin Date'] = formatPairAttributeSingle(pair.begin_date);
		}

		if (pair.end_date) {
			result['End Date'] = formatPairAttributeSingle(pair.end_date);
		}

		if (pair.ended) {
			result.Ended = formatPairAttributeSingle(pair.ended);
		}

		if (pair.publisher_type) {
			result['Publisher Type'] =
				formatPairAttributeSingle(pair.publisher_type, 'label');
		}

		return result;
	});
}

function formatWorkDiff(revision) {
	return revision.changes.map((pair) => {
		const result = formatEntityDiff(pair);

		if (pair.work_type) {
			result['Work Type'] =
				formatPairAttributeSingle(pair.work_type, 'label');
		}

		if (pair.languages) {
			result.Languages = [
				_.pluck(pair.languages[0], 'name'),
				_.pluck(pair.languages[1], 'name')
			];
		}

		return result;
	});
}

router.get('/:id', (req, res) => {
	Revision.findOne(req.params.id, {populate: ['entity', 'relationship']})
	.then((revision) => {
		let diff = null;

		if (revision.changes) {
			if (revision.entity) {
				// TODO: replace this with polymorphism
				switch (revision.entity._type) {
					case 'Edition':
						diff = formatEditionDiff(revision);
						break;
					case 'Publication':
						diff = formatPublicationDiff(revision);
						break;
					case 'Creator':
						diff = formatCreatorDiff(revision);
						break;
					case 'Publisher':
						diff = formatPublisherDiff(revision);
						break;
					case 'Work':
						diff = formatWorkDiff(revision);
						break;
					default:
						throw new Error(
							'Attempted to diff unknown entity type!'
						);
				}
			}
			else {
				diff = formatRelationshipDiff(revision);
			}
		}

		User.findOne(revision.user.user_id).then((user) => {
			revision.user = user;
			res.render('revision', {
				title: 'Revision',
				revision,
				diff
			});
		});
	});
});

module.exports = router;
