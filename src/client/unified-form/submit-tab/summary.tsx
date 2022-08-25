import {Badge, ListGroup} from 'react-bootstrap';
import {Entity, State, SummarySectionProps, SummarySectionStateProps} from '../interface/type';
import Immutable from 'immutable';
import React from 'react';
import SingleEntity from './single-entity';
import _ from 'lodash';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';


function SummarySection({
	Publishers,
	Works,
	Authors,
	Series,
	EditionGroups,
	languageOptions,
	Editions
}: SummarySectionProps) {
	const createdEntities = {
		Authors,
		EditionGroups,
		Editions,
		Publishers,
		Series,
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
					{newEntities.map((entity, index) => (<SingleEntity
						entity={entity} isLast={index === newEntities.length - 1}
						key={entity.id} languageOptions={languageOptions}
					                                     />))}
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
function mapStateToProps(state:State) {
	let EditionGroups:any[] = getEntitiesArray(state.get('EditionGroups'));
	const Editions:Entity[] = [{
		__isNew__: true,
		id: 'e0',
		text: state.getIn(['nameSection', 'name']),
		type: 'Edition',
		...convertMapToObject(state)
	}];
	if (EditionGroups.length === 0) {
		EditionGroups = [{...Editions[0]}];
		EditionGroups[0].name = EditionGroups[0].text;
		EditionGroups[0].language = EditionGroups[0].nameSection.language;
		EditionGroups[0].sortName = EditionGroups[0].nameSection.sortName;

		EditionGroups[0].type = 'EditionGroup';
		EditionGroups[0].id = 'eg0';
	}
	// copy global series section to selected series.
	const Series = getEntitiesArray(state.get('Series').map((series) => series.set('seriesSection', state.getIn(['seriesSection']))));
	return {
		Authors: getEntitiesArray(state.get('Authors')),
		EditionGroups,
		Editions,
		Publishers: getEntitiesArray(state.get('Publishers')),
		Series,
		Works: getEntitiesArray(state.get('Works'))
	};
}
export default connect<SummarySectionStateProps>(mapStateToProps)(SummarySection);
