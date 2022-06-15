import {Col, Row} from 'react-bootstrap';
import ButtonBar from '../../entity-editor/button-bar/button-bar';
import {CoverProps} from '../interface/type';
import ISBNField from './isbn-field';
import IdentifierEditor from '../../entity-editor/identifier-editor/identifier-editor';
import NameSection from '../../entity-editor/name-section/name-section';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import {connect} from 'react-redux';
import {updatePublisher} from '../../entity-editor/edition-section/actions';


export function CoverTab(props:CoverProps) {
	const {publisherValue, onPublisherChange, identifierEditorVisible} = props;
	return (
		<div>
			<NameSection {...props}/>
			<Row>
				<Col lg={{offset: 0, span: 6}}>
					<SearchEntityCreate
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
	// currently it only supports single publisher
	const singleNewPublisher = rootState.getIn(['Publishers', 'p0'], null);
	return {
		identifierEditorVisible: rootState.getIn(['buttonBar', 'identifierEditorVisible']),
		publisherValue: singleNewPublisher ?? rootState.getIn(['editionSection', 'publisher'])
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onPublisherChange: (value) => dispatch(updatePublisher(value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(CoverTab);
