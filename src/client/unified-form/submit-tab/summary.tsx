import {Badge, ListGroup} from 'react-bootstrap';
import Immutable from 'immutable';
import React from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';


type SummarySectionProps = {
	Authors: Array<any>,
	EditionGroups: Array<any>,
	Editions: Array<any>,
	Publishers: Array<any>,
	Works: Array<any>
};
function SummarySection({Publishers, Works, Authors, EditionGroups, Editions}:SummarySectionProps) {
	const createdEntities = {Authors, EditionGroups, Editions, Publishers, Works};
	function renderEntityGroup(entities:Array<any>, entityType:string) {
		return (

			<ListGroup.Item
				as="li"
				className="d-flex justify-content-between align-items-start"
			>
				<div className="ms-2 me-auto">
					<div className="font-weight-bold">{entityType}</div>
					{entities.map(
						(entity, index) =>
							<span key={entity.id}>{entity.nameSection.name + (index === entities.length - 1 ? '' : ', ')}</span>
					)}
				</div>
				<Badge pill bg="primary">
					{entities.length}
				</Badge>
			</ListGroup.Item>
		);
	}
	return (
		<div>
			<h4>New Entities</h4>
			<ListGroup as="ol">
				{_.map(createdEntities, renderEntityGroup)}
			</ListGroup>

		</div>
	);
}
function getEntitiesArray(state:Immutable.Map<string, any>) {
	return Object.values(convertMapToObject(state));
}
function mapStateToProps(state) {
	return {
		Authors: getEntitiesArray(state.get('Authors')),
		EditionGroups: getEntitiesArray(state.get('EditionGroups')),
		Editions: getEntitiesArray(state.get('Editions')),
		Publishers: getEntitiesArray(state.get('Publishers')),
		Works: getEntitiesArray(state.get('Works'))
	};
}
export default connect<SummarySectionProps>(mapStateToProps)(SummarySection);
