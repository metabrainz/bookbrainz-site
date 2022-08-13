import {Col, Row} from 'react-bootstrap';
import {CoverDispatchProps, CoverProps, CoverStateProps, EntitySelect, State} from '../interface/type';
import {clearPublisher, clearPublishers} from './action';
import AuthorCreditSection from '../../entity-editor/author-credit-editor/author-credit-section';
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
	const {publisherValue: publishers, onPublisherChange, identifierEditorVisible,
		onClearPublisher, handleClearPublishers, modalIsOpen, ...rest} = props;
	const publisherValue:EntitySelect[] = Object.values(convertMapToObject(publishers ?? {}));
	const onChangeHandler = React.useCallback((value:EntitySelect[], action) => {
		if (['remove-value', 'pop-value'].includes(action.action)) {
			if (action.removedValue.__isNew__) {
				onClearPublisher(action.removedValue.id);
			}
		}
		if (action.action === 'clear') {
			handleClearPublishers();
		}
		onPublisherChange(value);
	}, []);
	return (
		<div>
			<NameSection copyLanguages setDefault={modalIsOpen} {...rest}/>
			<AuthorCreditSection type="edition" {...rest}/>
			<Row>
				<Col lg={{offset: 0, span: 6}}>
					<SearchEntityCreate
						isMulti
						label="Publisher"
						type="publisher"
						value={publisherValue}
						onChange={onChangeHandler}
						{...rest}
					/>
				</Col>
			</Row>
			<Row>

				<Col lg={{offset: 0, span: 6}}>
					<ISBNField/>
				</Col>
			</Row>

			<ButtonBar {...rest}/>
			<IdentifierEditor show={identifierEditorVisible} {...rest}/>
		</div>

		 );
}

function mapStateToProps(rootState:State):CoverStateProps {
	return {
		identifierEditorVisible: rootState.getIn(['buttonBar', 'identifierEditorVisible']),
		modalIsOpen: rootState.get('entityModalIsOpen', false),
		publisherValue: rootState.getIn(['editionSection', 'publisher'], {})
	};
}

function mapDispatchToProps(dispatch):CoverDispatchProps {
	return {
		handleClearPublishers: () => dispatch(clearPublishers()),
		onClearPublisher: (arg) => dispatch(clearPublisher(arg)),
		onPublisherChange: (value) => dispatch(updatePublisher(Object.fromEntries(value.map((pub, index) => [index, pub]))))
	};
}

export default connect<CoverStateProps, CoverDispatchProps>(mapStateToProps, mapDispatchToProps)(CoverTab);
