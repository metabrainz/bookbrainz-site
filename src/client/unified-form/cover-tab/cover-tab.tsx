import {Col, Row} from 'react-bootstrap';
import {CoverProps, EntitySelect} from '../interface/type';
import ButtonBar from '../../entity-editor/button-bar/button-bar';
import ISBNField from './isbn-field';
import IdentifierEditor from '../../entity-editor/identifier-editor/identifier-editor';
import NameSection from '../../entity-editor/name-section/name-section';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {updatePublisher} from '../../entity-editor/edition-section/actions';


export function CoverTab(props:CoverProps) {
	const {publisherValue: publishers, onPublisherChange, identifierEditorVisible} = props;
	const publisherValue:EntitySelect[] = Object.values(convertMapToObject(publishers ?? {}));
	return (
		<div>
			<NameSection {...props}/>
			<Row>
				<Col lg={{offset: 0, span: 6}}>
					<SearchEntityCreate
						isMulti
						label="Publisher"
						type="publisher"
						value={publisherValue}
						onChange={onPublisherChange}
						{...props}
					/>
				</Col>
			</Row>
			<Row>

				<Col lg={{offset: 0, span: 6}}>
					<ISBNField/>
				</Col>
			</Row>

			<ButtonBar {...props}/>
			<IdentifierEditor show={identifierEditorVisible} {...props}/>
		</div>

		 );
}

function mapStateToProps(rootState) {
	const newPublishers = rootState.getIn(['Publishers'], {});
	return {
		identifierEditorVisible: rootState.getIn(['buttonBar', 'identifierEditorVisible']),
		publisherValue: newPublishers.merge(rootState.getIn(['editionSection', 'publisher'], {}))
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onPublisherChange: (value) => dispatch(updatePublisher(Object.fromEntries(value.map((pub, index) => [index, pub]))))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(CoverTab);
