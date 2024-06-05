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
import {faTasks, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {isNil, isString, size, values} from 'lodash';
import EntityLink from '../../entity-link';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';


const {
	Button, ButtonGroup, Card, ListGroup
} = bootstrap;

class MergeQueue extends React.Component {
	constructor(props) {
		super(props);

		const {mergeQueue} = props;
		if (isNil(mergeQueue) || !size(mergeQueue.mergingEntities)) {
			return;
		}
		const autoSelectedTarget = values(mergeQueue.mergingEntities)[0];
		if (isNil(autoSelectedTarget) || !isString(autoSelectedTarget.bbid)) {
			return;
		}
		this.state = {selectedOption: autoSelectedTarget.bbid};
	}

	state = {};

	handleOptionChange = (changeEvent) => {
		this.setState({
			selectedOption: changeEvent.target.value
		});
	};

	render() {
		const {mergeQueue} = this.props;
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
					{values(mergingEntities)
						.map(entity =>
							 (
								<ListGroup.Item className="bg-white" key={`merge-queue-${entity.bbid}`}>

									<input
										checked={this.state.selectedOption === entity.bbid}
										className="margin-right-1"
										title="Select entity"
										type="radio"
										value={entity.bbid}
										onChange={this.handleOptionChange}
									/>
									<EntityLink inline entity={entity}/>
								</ListGroup.Item>
							))}
				</ListGroup>
			);
		}

		return (
			<Card bg="light" className="margin-top-2">
				<h3 className="margin-top-0">
					Selected {entityCount} entit{entityCount > 1 ? 'ies' : 'y'} for merging
				</h3>
				<p className="text-muted">Select the entity you want to merge into, or add more duplicates to merge.<br/>
					After clicking <i>Merge into selected entity</i>, you will be redirected to a page where you can review the data before merging.
				</p>
				{entityList}
				<ButtonGroup className="d-inline-block">
					<Button
						disabled={isNil(this.state.selectedOption)}
						href={`/merge/submit/${this.state.selectedOption}`}
						title="Merge entities"
						variant="success"
					>
						<FontAwesomeIcon icon={faTasks}/>
						&nbsp;Merge into selected entity
					</Button>
					<Button
						disabled={isNil(this.state.selectedOption)}
						href={`/merge/remove/${this.state.selectedOption}`}
						title="Remove from merge"
						variant="warning"
					>
						<FontAwesomeIcon icon={faTrashAlt}/>
						&nbsp;Remove selected entity
					</Button>
					<Button
						href="/merge/cancel"
						title="Cancel merge"
						variant="danger"
					>
						<FontAwesomeIcon icon={faTrashAlt}/>
						&nbsp;Cancel merge
					</Button>
				</ButtonGroup>
			</Card>
		);
	}
}

MergeQueue.displayName = 'MergeQueue';
MergeQueue.propTypes = {
	mergeQueue: PropTypes.object.isRequired
};

export default MergeQueue;
