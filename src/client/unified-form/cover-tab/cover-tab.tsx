import {Col, Row} from 'react-bootstrap';
import {CoverDispatchProps, CoverProps, CoverStateProps, EntitySelect} from '../interface/type';
import AuthorCreditSection from '../../entity-editor/author-credit-editor/author-credit-section';
import ButtonBar from '../../entity-editor/button-bar/button-bar';
import ISBNField from './isbn-field';
import IdentifierEditor from '../../entity-editor/identifier-editor/identifier-editor';
import NameSection from '../../entity-editor/name-section/name-section';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import {clearPublisher} from './action';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {updatePublisher} from '../../entity-editor/edition-section/actions';


export function CoverTab(props:CoverProps) {
	const {publisherValue: publishers, onPublisherChange, identifierEditorVisible, onClearPublisher} = props;
	const publisherValue:EntitySelect[] = Object.values(convertMapToObject(publishers ?? {}));
	const onChangeHandler = React.useCallback((value:EntitySelect[], action) => {
		if (action.action === 'remove-value' || action.action === 'pop-value') {
			if (action.removedValue.__isNew__) {
				onClearPublisher(action.removedValue.id);
			}
		}
		onPublisherChange(value);
	}, []);
	return (
		<div>
			<NameSection {...props}/>
			<AuthorCreditSection {...props}/>
			<Row>
				<Col lg={{offset: 0, span: 6}}>
					<SearchEntityCreate
						isMulti
						label="Publisher"
						type="publisher"
						value={publisherValue}
						onChange={onChangeHandler}
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
		onClearPublisher: (arg) => dispatch(clearPublisher(arg)),
		onPublisherChange: (value) => dispatch(updatePublisher(Object.fromEntries(value.map((pub, index) => [index, pub]))))
	};
}

export default connect<CoverStateProps, CoverDispatchProps>(mapStateToProps, mapDispatchToProps)(CoverTab);
