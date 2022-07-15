import {Badge, ListGroup} from 'react-bootstrap';
import Immutable from 'immutable';
import React from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';


type Entity = {
	__isNew__: boolean,
	text:string,
	id:string
};
type SummarySectionProps = {
	Authors: Array<any>;
	EditionGroups: Array<any>;
	Editions: Array<any>;
	Publishers: Array<any>;
	Works: Array<any>;
};
function SummarySection({
	Publishers,
	Works,
	Authors,
	EditionGroups,
	Editions
}: SummarySectionProps) {
	const createdEntities = {
		Authors,
		EditionGroups,
		Editions,
		Publishers,
		Works
	};
	function renderEntityGroup(entities: Array<any>, entityType: string) {
		const newEntities = entities.filter((entity) => entity.__isNew__);
		if (newEntities.length === 0) {
			return null;
		}
		return (
			<ListGroup.Item
				as="li"
				className="d-flex justify-content-between align-items-start"
				key={`${entityType}-new`}
			>
				<div className="ms-2 me-auto">
					<div className="font-weight-bold">{entityType}</div>
					{newEntities.map((entity, index) => (
						<span key={entity.id}>
							{_.get(entity, 'text') + (index === newEntities.length - 1 ? '' : ', ')}
						</span>
					))}
				</div>
				<Badge pill bg="primary">
					{newEntities.length}
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
function getEntitiesArray(state: Immutable.Map<string, any>): Array<Entity> {
	return Object.values(convertMapToObject(state));
}
function mapStateToProps(state) {
	let EditionGroups = getEntitiesArray(state.get('EditionGroups'));
	const Editions:Entity[] = [{
		__isNew__: true,
		id: 'e0',
		text: state.getIn(['nameSection', 'name'])
	}];
	if (EditionGroups.length === 0) {
		EditionGroups = Editions;
		EditionGroups[0].id = 'eg0';
	}
	return {
		Authors: getEntitiesArray(state.get('Authors')),
		EditionGroups,
		Editions,
		Publishers: getEntitiesArray(state.get('Publishers')),
		Works: getEntitiesArray(state.get('Works'))
	};
}
export default connect<SummarySectionProps>(mapStateToProps)(SummarySection);
