import {SearchEntityCreateDispatchProps, SearchEntityCreateProps} from '../interface/type';
import {addAuthor, addPublisher} from '../cover-tab/action';
import {addSeries, addWork} from '../content-tab/action';
import {checkIfNameExists, searchName, updateNameField, updateSortNameField} from '../../entity-editor/name-section/actions';
import {closeEntityModal, dumpEdition, loadEdition, openEntityModal} from '../action';
import AsyncCreatable from 'react-select/async-creatable';
import BaseEntitySearch from '../../entity-editor/common/entity-search-field-option';
import CreateEntityModal from './create-entity-modal';
import React from 'react';
import {addEditionGroup} from '../detail-tab/action';
import {connect} from 'react-redux';
import makeImmutable from '../../entity-editor/common/make-immutable';
import {submitSingleEntity} from '../../entity-editor/submission-section/actions';


const ImmutableCreatableAsync = makeImmutable(AsyncCreatable);
const addEntityAction = {
	author: addAuthor,
	editionGroup: addEditionGroup,
	publisher: addPublisher,
	series: addSeries,
	work: addWork
};
function SearchEntityCreate(props:SearchEntityCreateProps) {
	const {type, nextId, onModalOpen, onModalClose, onSubmitEntity, rowId, onOpenCallback, ...rest} = props;
	const createLabel = React.useCallback((input) => `Create ${type} "${input}"`, [type]);
	const [showModal, setShowModal] = React.useState(false);
	const getNewOptionData = React.useCallback((_, label) => ({
		__isNew__: true,
		id: nextId,
		text: label,
		type
	}), [type, nextId]);
	const openModalHandler = React.useCallback((name) => {
		if (typeof onOpenCallback === 'function') {
			onOpenCallback();
		}
		setShowModal(true);
		onModalOpen(name);
	}, [onModalOpen]);
	const closeModalHandler = React.useCallback(() => {
		setShowModal(false);
		onModalClose();
	}, [onModalClose]);
	const submitModalHandler = React.useCallback((ev: React.FormEvent) => {
		ev.preventDefault();
		ev.stopPropagation();
		setShowModal(false);
		onSubmitEntity(rowId);
		onModalClose();
	}, [onSubmitEntity, onModalClose, rowId]);
	// always show `create new entity` Option when user types in the search field
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
SearchEntityCreate.defaultProps = {
	bbid: null,
	empty: true,
	error: false,
	filters: [],
	languageOptions: [],
	rowId: null,
	tooltipText: null
};

function mapDispatchToProps(dispatch, {type, submissionUrl, onAddCallback}):SearchEntityCreateDispatchProps {
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
		onSubmitEntity: (arg) => dispatch(submitSingleEntity(submissionUrl, type,
			(val) => {
				if (typeof onAddCallback === 'function') {
					onAddCallback(val);
				}
				return addEntityAction[type](val, arg);
			}))
	};
}

export default connect<null, SearchEntityCreateDispatchProps>(null, mapDispatchToProps)(SearchEntityCreate);

