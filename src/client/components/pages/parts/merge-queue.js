/*
 * Copyright (C) 2019  Nicolas Pelletier
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

import * as bootstrap from 'react-bootstrap';
import {get, isNil, size, values} from 'lodash';
import Entity from '../../../entity-editor/common/entity';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {getEntityLink} from '../../../../server/helpers/utils';


const {
	Button, ButtonGroup, ListGroup, ListGroupItem, Well
} = bootstrap;

function MergeQueue({mergeQueue}) {
	if (isNil(mergeQueue)) {
		return null;
	}
	const {mergingEntities} = mergeQueue;
	const entityCount = size(mergingEntities);
	let entityList;
	if (entityCount === 0) {
		entityList = <div>No entities selected for merge</div>;
	}
	else {
		entityList = (
			<ListGroup>
				{values(mergingEntities).map(entity => {
					const entityForDisplay = {
						link: getEntityLink({bbid: entity.bbid, type: entity.type}),
						text: get(entity, ['defaultAlias', 'name']),
						type: entity.type,
						unnamedText: '(unnamed)'
					};
					return (
						<ListGroupItem key={`merge-queue-${entity.bbid}`}>
							<Button
								bsSize="sm"
								bsStyle="link"
								className="margin-right-1"
								href={`/merge/remove/${entity.bbid}`}
								title="Remove from merge"
							>
								<FontAwesomeIcon icon="trash-alt"/>
							</Button>
							<Entity {...entityForDisplay}/>
						</ListGroupItem>
					);
				})}
			</ListGroup>
		);
	}

	return (
		<Well>
			<h3>
				Selected {entityCount} entit{entityCount > 1 ? 'ies' : 'y'} for merging
			</h3>
			{entityList}
			<ButtonGroup>
				<Button
					bsStyle="success"
					href="/merge/submit"
					title="Merge entities"
				>
					<FontAwesomeIcon icon="tasks"/>
					&nbsp;Merge entities
				</Button>
				<Button
					bsStyle="danger"
					href="/merge/cancel"
					title="Cancel merge"
				>
					<FontAwesomeIcon icon="trash-alt"/>
					&nbsp;Cancel merge
				</Button>
			</ButtonGroup>
		</Well>
	);
}

MergeQueue.displayName = 'MergeQueue';
MergeQueue.propTypes = {
	mergeQueue: PropTypes.object.isRequired
};

export default MergeQueue;
