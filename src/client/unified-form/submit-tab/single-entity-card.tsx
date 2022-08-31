import {Card} from 'react-bootstrap';
import React from 'react';
import {SingleEntityCardProps} from '../interface/type';
import _ from 'lodash';
import {dateObjectToISOString} from '../../helpers/utils';

/* eslint-disable sort-keys */
const BASE_ENTITY = {
	Name: 'name',
	Type: 'type',
	Language: 'defaultAlias.languageId',
	'Sort-Name': 'sortName',
	Disambiguation: 'disambiguation',
	Annotation: 'annotation.content',
	'Edit-Note': 'submissionSection.note'

};
const ENTITY_FIELDS = {
	edition: {
		Name: 'nameSection.name',
		Language: 'nameSection.language',
		'Sort-Name': 'nameSection.sortName',
		Disambiguation: 'nameSection.disambiguation',
		Annotation: 'annotationSection.content',
		format: 'editionSection.format',
		'Release-date': 'editionSection.releaseDate',
		status: 'editionSection.status',
		'Edition-Languages': 'editionSection.languages',
		pages: 'editionSection.pages',
		width: 'editionSection.width',
		height: 'editionSection.height',
		weight: 'editionSection.weight',
		depth: 'editionSection.depth'
	},
	editionGroup: {
		...BASE_ENTITY,
		'EditionGroup-Type': 'typeId'
	},
	author: {
		...BASE_ENTITY,
		Gender: 'genderId',
		'Author-Type': 'typeId',
		'Begin-Date': 'beginDate',
		'Begin-Area': 'beginArea.text',
		'Dead?': 'ended',
		'End-Date': 'endDate',
		'End-Area': 'endArea.text'
	},
	publisher: {
		...BASE_ENTITY,
		'Publihser-Type': 'typeId',
		'Begin-Date': 'beginDate',
		'Dissolved?': 'ended',
		'End-Date': 'endDate'

	},
	series: {
		...BASE_ENTITY,
		orderType: 'orderingTypeId',
		'Series-Items': 'seriesSection.seriesItems',
		'series-Type': 'seriesEntityType'
	},
	work: {
		...BASE_ENTITY,
		'Work-Type': 'typeId',
		'Work-Languages': 'languages'
	}
};
export default function SingleEntityCard({entity, languageOptions}:SingleEntityCardProps) {
	const id2LanguageMap = React.useMemo(() => Object.fromEntries(_.map(languageOptions, (option) => [option.id, option.name])), []);
	// display formatted entity attributes in modal
	function renderField(path, key) {
		let fieldVal = _.get(entity, path, '');
		if (!fieldVal || (fieldVal.length === 0) || key === 'Name') {
			return;
		}
		if (key === 'Language') {
			fieldVal = id2LanguageMap[fieldVal];
		}
		// correctly format multiple languages
		if (path.includes('languages')) {
			fieldVal = _.reduce(fieldVal, (acc, next) => `${acc}${acc.length !== 0 ? ',' : ''} ${next.label}`, '');
		}
		// correctly format series items
		if (path.includes('seriesItems')) {
			fieldVal = _.reduce(
				fieldVal,
				(acc, nextVal) => `${acc.length > 0 ? `${acc}, ` : acc}${_.get(nextVal, ['sourceEntity', 'defaultAlias', 'name'], '<unknown>')}`, ''
			);
		}
		// correctly format date attribute
		if (path.includes('Date')) {
			if (typeof fieldVal !== 'string') {
				if (!fieldVal.day && !fieldVal.month && !fieldVal.year) {
					return;
				}
				fieldVal = dateObjectToISOString(fieldVal);
			}
		}
		// make sure attribute is stringified
		// eslint-disable-next-line consistent-return
		return <span className="d-block"><b>{key}</b>: {typeof fieldVal === 'string' ? fieldVal : JSON.stringify(fieldVal)}</span>;
	}
	const entityFields = ENTITY_FIELDS[_.camelCase(entity.type)] ?? {};
	return (
		<Card className="review-card">
			<Card.Header>{_.get(entity, entityFields.Name, '<unknown>')}</Card.Header>
			<Card.Body>
				{_.map(entityFields, renderField)}
			</Card.Body>
		</Card>
	);
}
