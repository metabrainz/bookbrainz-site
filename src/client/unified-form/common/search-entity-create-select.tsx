import {SearchEntityCreateDispatchProps, SearchEntityCreateProps} from '../interface/type';
import {addAuthor, addPublisher} from '../cover-tab/action';
import {dumpEdition, loadEdition} from '../action';
import {updateNameField, updateSortNameField} from '../../entity-editor/name-section/actions';
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
function SearchEntityCreate(props:SearchEntityCreateProps):JSX.Element {
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

	return (
		<>
			<BaseEntitySearch
				isClearable
				SelectWrapper={ImmutableCreatableAsync}
				formatCreateLabel={createLabel}
				getNewOptionData={getNewOptionData}
				onCreateOption={openModalHandler}
				{...props}
			/>
			<CreateEntityModal handleClose={closeModalHandler} handleSubmit={submitModalHandler} show={showModal} type={type} {...rest}/>
		</>);
}
SearchEntityCreate.defaultProps = defaultProps;

function mapDispatchToProps(dispatch, {type}):SearchEntityCreateDispatchProps {
	return {
		onModalClose: () => dispatch(loadEdition()),
		onModalOpen: (name) => {
			dispatch(dumpEdition());
			dispatch(updateNameField(name));
			dispatch(updateSortNameField(name));
		},
		onSubmitEntity: (arg) => dispatch(addEntityAction[type](arg))
	};
}

export default connect<null, SearchEntityCreateDispatchProps>(null, mapDispatchToProps)(SearchEntityCreate);

