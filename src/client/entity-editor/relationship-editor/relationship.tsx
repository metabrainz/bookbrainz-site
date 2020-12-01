/*
 * Copyright (C) 2018  Ben Ockmore
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

import * as React from 'react';

import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import type {RelationshipType, Entity as _Entity} from './types';
import Entity from '../common/entity';
import _ from 'lodash';
import {getEntityLink} from '../../../server/helpers/utils';


function getEntityObjectForDisplay(entity: _Entity, makeLink: boolean) {
	const link = makeLink && entity.bbid &&
		getEntityLink({bbid: entity.bbid, type: entity.type});
	let disambiguation = _.get(entity, ['disambiguation']);
	if (_.has(disambiguation, 'comment')) {
		disambiguation = disambiguation.comment;
	}
	return {
		disambiguation,
		link,
		text: _.get(entity, ['defaultAlias', 'name']),
		type: entity.type,
		unnamedText: entity.bbid ? '(unnamed)' : 'New Entity'
	};
}

type RelationshipProps = {
	link: boolean, // eslint-disable-line react/require-default-props
	contextEntity: _Entity | null | undefined, // eslint-disable-line react/require-default-props
	sourceEntity: _Entity,
	targetEntity: _Entity,
	relationshipType: RelationshipType
};

function Relationship({
	contextEntity, link, relationshipType, sourceEntity, targetEntity
}: RelationshipProps) {
	const {depth, description, id, linkPhrase, reverseLinkPhrase} = relationshipType;

	const reversed = contextEntity &&
		(_.get(contextEntity, 'bbid') === _.get(targetEntity, 'bbid'));

	const sourceObject = getEntityObjectForDisplay(
		reversed ? targetEntity : sourceEntity, link
	);
	const targetObject = getEntityObjectForDisplay(
		reversed ? sourceEntity : targetEntity, link
	);

	const usedLinkPhrase = reversed ? reverseLinkPhrase : linkPhrase;

	// If there is a depth structure, indent accordingly by setting a margin on the left
	let indentationClass = '';
	if (typeof depth !== 'undefined') {
		indentationClass = `margin-left-d${8 * depth}`;
	}

	return (
		<OverlayTrigger
			delayShow={50}
			overlay={<Tooltip id={`tooltip-${id}`}>{description}</Tooltip>}
			placement="bottom"
		>
			<div aria-label={description} className={indentationClass}>
				<Entity {...sourceObject}/>
				{` ${usedLinkPhrase} `}
				<Entity {...targetObject}/>
			</div>
		</OverlayTrigger>
	);
}
Relationship.displayName = 'Relationship';
Relationship.defaultProps = {
	contextEntity: null, // eslint-disable-line react/default-props-match-prop-types, max-len
	link: false // eslint-disable-line react/default-props-match-prop-types
};

export default Relationship;
