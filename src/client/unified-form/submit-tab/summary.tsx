import {Entity, State, SummarySectionProps, SummarySectionStateProps} from '../interface/type';
import Immutable from 'immutable';
import React from 'react';
import SingleEntityCard from './single-entity-card';
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
	function renderEntityGroup(entities: Array<any>) {
		const newEntities = entities.filter((entity) => entity.__isNew__);
		if (newEntities.length === 0) {
			return null;
		}
		return (
			<div className="ms-2 me-auto">
				{newEntities.map((entity) => (<SingleEntityCard
					entity={entity}
					key={entity.id} languageOptions={languageOptions}
				                              />))
				}
			</div>
		);
	}
	return (
		<div>
			<h3>New Entities</h3>
			<p className="text-muted">Below you can see a preview of the entities you are about to create
			or have created in the process of filling the form. Please verify the information and
			make any adjustment if necessary before submitting the form
			</p>
			<section className="review-section">
				{_.map(createdEntities, renderEntityGroup)}
			</section>
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
