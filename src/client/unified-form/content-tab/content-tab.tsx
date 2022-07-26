import * as Bootstrap from 'react-bootstrap/';
import {ContentTabDispatchProps, ContentTabProps, ContentTabStateProps, State} from '../interface/type';
import {addWork, copyWork} from './action';
import {closeEntityModal, dumpEdition, loadEdition, openEntityModal} from '../action';
import CreateEntityModal from '../common/create-entity-modal';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import WorkRow from './work-row';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {map} from 'lodash';


const {Row, Col, FormCheck} = Bootstrap;
export function ContentTab({value, onChange, onModalClose, onModalOpen, ...rest}:ContentTabProps) {
	const [isChecked, setIsChecked] = React.useState(false);
	const toggleCheck = React.useCallback(() => setIsChecked(!isChecked), [isChecked]);
	const [showModal, setShowModal] = React.useState(false);
	const openModalHandler = React.useCallback((id) => {
		setShowModal(true);
		onModalOpen(id);
	}, []);
	const closeModalHandler = React.useCallback(() => {
		setShowModal(false);
		onModalClose();
	}, []);
	const submitModalHandler = React.useCallback((ev: React.FormEvent) => {
		ev.preventDefault();
		ev.stopPropagation();
		setShowModal(false);
		onChange(null);
		onModalClose();
	}, []);
	const onChangeHandler = React.useCallback((work:any) => {
		work.checked = isChecked;
		onChange(work);
	}, [isChecked, onChange]);
	return (
		<>
			<h3>Works</h3>
			{map(value, (work, rowId) => <WorkRow key={rowId} rowId={rowId} onCopyHandler={openModalHandler} {...rest}/>)}
			<CreateEntityModal handleClose={closeModalHandler} handleSubmit={submitModalHandler} show={showModal} type="work" {...rest}/>
			<Row>
				<Col lg={{span: 6}}>
					<SearchEntityCreate
						isClearable={false}
						type="work"
						value={null}
						onChange={onChangeHandler}
						{...rest}
					/>
				</Col>
			</Row>
			<FormCheck
				className="ml-1"
				defaultChecked={isChecked}
				id="works-check"
				label="Copy authors from AC for this work"
				type="checkbox"
				onChange={toggleCheck}
			/>
		</>
	);
}

function mapStateToProps(rootState:State) {
	const worksObj = convertMapToObject(rootState.get('Works'));
	return {
		value: worksObj
	};
}
function mapDispatchToProps(dispatch) {
	const type = 'Work';
	return {
		onChange: (value:any) => dispatch(addWork(value)),
		onModalClose: () => dispatch(loadEdition()) && dispatch(closeEntityModal()),
		onModalOpen: (id) => {
			dispatch(dumpEdition(type));
			dispatch(copyWork(id));
			dispatch(openEntityModal());
		}
	};
}

export default connect<ContentTabStateProps, ContentTabDispatchProps>(mapStateToProps, mapDispatchToProps)(ContentTab);
