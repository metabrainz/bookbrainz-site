import {Col, Row} from 'react-bootstrap';
import ButtonBar from '../../entity-editor/button-bar/button-bar';
import {CoverProps} from '../interface/type';
import EntitySearchFieldOption from '../../entity-editor/common/entity-search-field-option';
import ISBNField from './isbn-field';
import IdentifierEditor from '../../entity-editor/identifier-editor/identifier-editor';
import NameSection from '../../entity-editor/name-section/name-section';
import React from 'react';
import {connect} from 'react-redux';
import {updatePublisher} from '../../entity-editor/edition-section/actions';


export function CoverTab(props:CoverProps) {
	const {publisherValue, onPublisherChange, identifierEditorVisible} = props;
	return (
		<div>
			<NameSection {...props} isUf/>
			<Row>
				<Col lg={{offset: 0, span: 6}}>
					<EntitySearchFieldOption
						instanceId="publisher"
						label="Publisher"
						type="publisher"
						value={publisherValue}
						onChange={onPublisherChange}
					/>
				</Col>
			</Row>
			<Row>

				<Col lg={{offset: 0, span: 6}}>
					<ISBNField/>
				</Col>
			</Row>

			<ButtonBar {...props} isUf/>
			<IdentifierEditor show={identifierEditorVisible} {...props}/>
		</div>

		 );
}

function mapStateToProps(rootState) {
	return {
		identifierEditorVisible: rootState.getIn(['buttonBar', 'identifierEditorVisible']),
		publisherValue: rootState.get('publisher')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onPublisherChange: (value) => dispatch(updatePublisher(value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(CoverTab);
