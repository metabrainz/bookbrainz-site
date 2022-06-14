import {SearchEntityCreateDispatchProps, SearchEntityCreateProps} from '../interface/type';
import {dumpEdition, loadEdition} from '../action';
import AsyncCreatable from 'react-select/async-creatable';
import BaseEntitySearch from '../../entity-editor/common/entity-search-field-option';
import CreateEntityModal from './create-entity-modal';
import React from 'react';
import {addEditionGroup} from '../detail-tab/action';
import {addPublisher} from '../cover-tab/action';
import {addWork} from '../content-tab/action';
import {connect} from 'react-redux';
import makeImmutable from '../../entity-editor/common/make-immutable';
import {updateNameField} from '../../entity-editor/name-section/actions';


const ImmutableCreatableAsync = makeImmutable(AsyncCreatable);
const defaultProps = {
	bbid: null,
	empty: true,
	error: false,
	filters: [],
	languageOptions: [],
	tooltipText: null
};
const addEntityAction = {
	editionGroup: addEditionGroup,
	publisher: addPublisher,
	work: addWork
};
function SearchEntityCreate(props:SearchEntityCreateProps):JSX.Element {
	const {type, nextId, onModalOpen, onModalClose, onSubmitEntity, ...rest} = props;
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
		onSubmitEntity();
		onModalClose();
	}, []);

	return (
		<>
			<BaseEntitySearch
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
		},
		onSubmitEntity: () => dispatch(addEntityAction[type]())
	};
}

export default connect<null, SearchEntityCreateDispatchProps>(null, mapDispatchToProps)(SearchEntityCreate);

