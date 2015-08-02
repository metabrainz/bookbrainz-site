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

var express = require('express');
var router = express.Router();
var Revision = require('../data/properties/revision');
var User = require('../data/user');
var _ = require('underscore');

function formatRelationshipDiff(revision) {
	return revision.changes.map(function formatPair(pair) {
		var result = {};

		if (pair.entities) {
			result.Entities = [
				pair.entities[0].map(function getEntityName(entity) {
					return entity.entity.entity_gid;
				}),
				pair.entities[1].map(function getEntityName(entity) {
					return entity.entity.entity_gid;
				})
			];
		}

		if (pair.texts) {
			result.Texts = [
				_.pluck(pair.texts[0], 'text'),
				_.pluck(pair.texts[1], 'text')
			];
		}

		if (pair.relationship_type) {
			result['Relationship Type'] = [
				pair.relationship_type[0] ?
					[pair.relationship_type[0].label] : null,
				pair.relationship_type[1] ?
					[pair.relationship_type[1].label] : null
			];
		}

		return result;
	});
}

function formatEntityDiff(pair) {
	var result = {};

	if (pair.annotation) {
		result.Annotation = [
			pair.annotation[0] !== null ? [pair.annotation[0].content] : null,
			pair.annotation[1] !== null ? [pair.annotation[1].content] : null
		];
	}

	if (pair.disambiguation) {
		result.Disambiguation = [
			pair.disambiguation[0] !== null ?
				[pair.disambiguation[0].comment] : null,
			pair.disambiguation[1] !== null ?
				[pair.disambiguation[1].comment] : null
		];
	}

	if (pair.default_alias) {
		result['Default Alias'] = [
			pair.default_alias[0] !== null ?
				[pair.default_alias[0].name] : null,
			pair.default_alias[1] !== null ?
				[pair.default_alias[1].name] : null
		];
	}

	if (pair.aliases) {
		result.Aliases = [
			_.pluck(pair.aliases[0], 'name'),
			_.pluck(pair.aliases[1], 'name')
		];
	}

	if (pair.identifiers) {
		result.Identifiers = [
			pair.identifiers[0].map(function formatIdentifier(identifier) {
				return identifier.identifier_type.label +
					': ' + identifier.value;
			}),
			pair.identifiers[1].map(function formatIdentifier(identifier) {
				return identifier.identifier_type.label +
					': ' + identifier.value;
			})
		];
	}

	console.log(result);
	return result;
}

function formatPublicationDiff(revision) {
	return revision.changes.map(function formatPair(pair) {
		var result = formatEntityDiff(pair);

		if (pair.publication_type) {
			result['Publication Type'] = [
				pair.publication_type[0] !== null ?
					[pair.publication_type[0].label] : null,
				pair.publication_type[1] !== null ?
					[pair.publication_type[1].label] : null
			];
		}

		return result;
	});
}

function formatCreatorDiff(revision) {
	return revision.changes.map(function formatPair(pair) {
		var result = formatEntityDiff(pair);

		if (pair.begin_date) {
			result['Begin Date'] = [
				pair.begin_date[0] !== null ? [pair.begin_date[0]] : null,
				pair.begin_date[1] !== null ? [pair.begin_date[1]] : null
			];
		}

		if (pair.end_date) {
			result['End Date'] = [
				pair.end_date[0] !== null ? [pair.end_date[0]] : null,
				pair.end_date[1] !== null ? [pair.end_date[1]] : null
			];
		}

		if (pair.ended) {
			result.Ended = [
				pair.ended[0] !== null ? [pair.ended[0]] : null,
				pair.ended[1] !== null ? [pair.ended[1]] : null
			];
		}

		if (pair.gender) {
			result.Gender = [
				pair.gender[0] !== null ? [pair.gender[0].name] : null,
				pair.gender[1] !== null ? [pair.gender[1].name] : null
			];
		}

		if (pair.creator_type) {
			result['Creator Type'] = [
				pair.creator_type[0] !== null ?
					[pair.creator_type[0].label] : null,
				pair.creator_type[1] !== null ?
					[pair.creator_type[1].label] : null
			];
		}

		return result;
	});
}

function formatEditionDiff(revision) {
	return revision.changes.map(function formatPair(pair) {
		var result = formatEntityDiff(pair);

		if (pair.release_date) {
			result['Release Date'] = [
				pair.release_date[0] !== null ? [pair.release_date[0]] : null,
				pair.release_date[1] !== null ? [pair.release_date[1]] : null
			];
		}

		if (pair.pages) {
			result['Page Count'] = [
				pair.pages[0] !== null ? [pair.pages[0]] : null,
				pair.pages[1] !== null ? [pair.pages[1]] : null
			];
		}

		if (pair.width) {
			result.Width = [
				pair.width[0] !== null ? [pair.width[0]] : null,
				pair.width[1] !== null ? [pair.width[1]] : null
			];
		}

		if (pair.height) {
			result.Height = [
				pair.height[0] !== null ? [pair.height[0]] : null,
				pair.height[1] !== null ? [pair.height[1]] : null
			];
		}

		if (pair.depth) {
			result.Depth = [
				pair.depth[0] !== null ? [pair.depth[0]] : null,
				pair.depth[1] !== null ? [pair.depth[1]] : null
			];
		}

		if (pair.weight) {
			result.Weight = [
				pair.weight[0] !== null ? [pair.weight[0]] : null,
				pair.weight[1] !== null ? [pair.weight[1]] : null
			];
		}

		if (pair.edition_format) {
			result['Edition Format'] = [
				pair.edition_format[0] !== null ?
					[pair.edition_format[0].label] : null,
				pair.edition_format[1] !== null ?
					[pair.edition_format[1].label] : null
			];
		}

		if (pair.edition_status) {
			result['Edition Status'] = [
				pair.edition_status[0] !== null ?
					[pair.edition_status[0].label] : null,
				pair.edition_status[1] !== null ?
					[pair.edition_status[1].label] : null
			];
		}

		if (pair.language) {
			result.Language = [
				pair.language[0] !== null ? [pair.language[0].name] : null,
				pair.language[1] !== null ? [pair.language[1].name] : null
			];
		}

		if (pair.publication) {
			result.Publication = [
				pair.publication[0] !== null ?
					[pair.publication[0].entity_gid] : null,
				pair.publication[1] !== null ?
					[pair.publication[1].entity_gid] : null
			];
		}

		if (pair.publisher) {
			result.Publisher = [
				pair.publisher[0] !== null ?
					[pair.publisher[0].entity_gid] : null,
				pair.publisher[1] !== null ?
					[pair.publisher[1].entity_gid] : null
			];
		}

		return result;
	});
}

function formatPublisherDiff(revision) {
	return revision.changes.map(function formatPair(pair) {
		var result = formatEntityDiff(pair);

		if (pair.begin_date) {
			result['Begin Date'] = [
				pair.begin_date[0] !== null ? [pair.begin_date[0]] : null,
				pair.begin_date[1] !== null ? [pair.begin_date[1]] : null
			];
		}

		if (pair.end_date) {
			result['End Date'] = [
				pair.end_date[0] !== null ? [pair.end_date[0]] : null,
				pair.end_date[1] !== null ? [pair.end_date[1]] : null
			];
		}

		if (pair.ended) {
			result.Ended = [
				pair.ended[0] !== null ? [pair.ended[0]] : null,
				pair.ended[1] !== null ? [pair.ended[1]] : null
			];
		}

		if (pair.publisher_type) {
			result['Publisher Type'] = [
				pair.publisher_type[0] !== null ?
					[pair.publisher_type[0].label] : null,
				pair.publisher_type[1] !== null ?
					[pair.publisher_type[1].label] : null
			];
		}

		return result;
	});
}

function formatWorkDiff(revision) {
	return revision.changes.map(function formatPair(pair) {
		var result = formatEntityDiff(pair);

		if (pair.work_type) {
			result['Work Type'] = [
				pair.work_type[0] !== null ? [pair.work_type[0].label] : null,
				pair.work_type[1] !== null ? [pair.work_type[1].label] : null
			];
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

router.get('/:id', function(req, res) {
	Revision.findOne(req.params.id, {populate: ['entity', 'relationship']})
	.then(function(revision) {
		var diff = null;
		console.log(revision);
		if (revision.changes) {
			if (revision.entity) {
				console.log(revision.entity);
				if (revision.entity._type === 'Edition') {
					diff = formatEditionDiff(revision);
				}
				else if (revision.entity._type === 'Publication') {
					diff = formatPublicationDiff(revision);
				}
				else if (revision.entity._type === 'Creator') {
					diff = formatCreatorDiff(revision);
				}
				else if (revision.entity._type === 'Publisher') {
					diff = formatPublisherDiff(revision);
				}
				else if (revision.entity._type === 'Work') {
					diff = formatWorkDiff(revision);
				}
				else {
					diff = formatEntityDiff(revision);
				}
			}
			else {
				diff = formatRelationshipDiff(revision);
			}
		}

		User.findOne(revision.user.user_id).then(function(user) {
			revision.user = user;
			res.render('revision', {
				title: 'Revision',
				revision: revision,
				diff: diff
			});
		});
	});
});

module.exports = router;
