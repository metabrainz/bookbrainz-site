import {SearchEntityCreateDispatchProps, SearchEntityCreateProps} from '../interface/type';
import {addAuthor, addPublisher} from '../cover-tab/action';
import {checkIfNameExists, searchName, updateNameField, updateSortNameField} from '../../entity-editor/name-section/actions';
import {closeEntityModal, dumpEdition, loadEdition, openEntityModal} from '../action';
import AsyncCreatable from 'react-select/async-creatable';
import BaseEntitySearch from '../../entity-editor/common/entity-search-field-option';
import CreateEntityModal from './create-entity-modal';
import React from 'react';
import {addEditionGroup} from '../detail-tab/action';
import {addWork} from '../content-tab/action';
import {connect} from 'react-redux';
import makeImmutable from '../../entity-editor/common/make-immutable';


const ImmutableCreatableAsync = makeImmutable(AsyncCreatable);
const defaultProps = {
	bbid: null,
	empty: true,
	error: false,
	filters: [],
	languageOptions: [],
	rowId: null,
	tooltipText: null
};
const addEntityAction = {
	author: addAuthor,
	editionGroup: addEditionGroup,
	publisher: addPublisher,
	work: addWork
};
function SearchEntityCreate(props:SearchEntityCreateProps) {
	const {type, nextId, onModalOpen, onModalClose, onSubmitEntity, rowId, ...rest} = props;
	const createLabel = React.useCallback((input) => `Create ${type} "${input}"`, [type]);
	const [showModal, setShowModal] = React.useState(false);
	const getNewOptionData = React.useCallback((input, label) => ({
		__isNew__: true,
		id: nextId,
		text: label,
		type
	}), [type, nextId]);
	const openModalHandler = React.useCallback((name) => {
		setShowModal(true);
		onModalOpen(name);
	}, []);
	const closeModalHandler = React.useCallback(() => {
		setShowModal(false);
		onModalClose();
	}, []);
	const submitModalHandler = React.useCallback((ev: React.FormEvent) => {
		ev.preventDefault();
		ev.stopPropagation();
		setShowModal(false);
		onSubmitEntity(rowId);
		onModalClose();
	}, []);
	const isValidNewOption = React.useCallback((input) => input.length > 0, []);
	return (
		<>
			<BaseEntitySearch
				isClearable
				SelectWrapper={ImmutableCreatableAsync}
				formatCreateLabel={createLabel}
				getNewOptionData={getNewOptionData}
				isValidNewOption={isValidNewOption}
				onCreateOption={openModalHandler}
				{...props}
			/>
			<CreateEntityModal handleClose={closeModalHandler} handleSubmit={submitModalHandler} show={showModal} type={type} {...rest}/>
		</>);
}
SearchEntityCreate.defaultProps = defaultProps;

function mapDispatchToProps(dispatch, {type}):SearchEntityCreateDispatchProps {
	return {
		onModalClose: () => dispatch(loadEdition()) && dispatch(closeEntityModal()),
		onModalOpen: (name) => {
			dispatch(dumpEdition(type));
			dispatch(updateNameField(name));
			dispatch(updateSortNameField(name));
			dispatch(checkIfNameExists(name, null, type, null));
			dispatch(searchName(name, null, type));
			dispatch(openEntityModal());
		},
		onSubmitEntity: (arg) => dispatch(addEntityAction[type](arg))
	};
}

export default connect<null, SearchEntityCreateDispatchProps>(null, mapDispatchToProps)(SearchEntityCreate);

