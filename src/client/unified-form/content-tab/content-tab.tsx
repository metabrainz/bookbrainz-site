import * as Bootstrap from 'react-bootstrap/';
import {ContentTabDispatchProps, ContentTabProps, ContentTabStateProps, State} from '../interface/type';
import {addSeries, addWork, duplicateWork} from './action';
import {closeEntityModal, dumpEdition, loadEdition, openEntityModal} from '../action';
import {removeAllSeriesItems, updateOrderType, updateSeriesType} from '../../entity-editor/series-section/actions';
import CreateEntityModal from '../common/create-entity-modal';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import SeriesItemModal from './series-item-modal';
import WorkRow from './work-row';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {map} from 'lodash';


const {Row, Col, FormCheck, Button, OverlayTrigger, FormLabel, Tooltip} = Bootstrap;
export function ContentTab({works, onChange, onModalClose, onModalOpen, onSeriesChange, series, ...rest}:ContentTabProps) {
	const [isChecked, setIsChecked] = React.useState(true);
	const [isSeriesModalOpen, setIsSeriesModalOpen] = React.useState(false);
	const onHideHandler = React.useCallback(() => setIsSeriesModalOpen(false), [setIsSeriesModalOpen]);
	const onShowHandler = React.useCallback(() => setIsSeriesModalOpen(true), [setIsSeriesModalOpen]);
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
	const checkToolTip = (
		<Tooltip id="work-check">This will set the book&apos;s Author Credits from the &lsquo;Cover&lsquo; tab as this Work&apos;s
	 Author
		</Tooltip>);
	const checkLabel = (
		<>
			<FormLabel className="font-weight-normal">
			Copy Authors from Author Credit
				<OverlayTrigger
					delay={50}
					overlay={checkToolTip}
				>
					<FontAwesomeIcon
						className="margin-left-0-5"
						icon={faInfoCircle}
					/>
				</OverlayTrigger>
			</FormLabel>
		</>);
	return (
		<>
			<div>
				<h3>Works</h3>
				{map(works, (_, rowId) => <WorkRow key={rowId} rowId={rowId} onCopyHandler={openModalHandler} {...rest}/>)}
				<CreateEntityModal handleClose={closeModalHandler} handleSubmit={submitModalHandler} show={showModal} type="work" {...rest}/>
				<SeriesItemModal show={isSeriesModalOpen} onHideHandler={onHideHandler} {...rest}/>
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
					label={checkLabel}
					type="checkbox"
					onChange={toggleCheck}
				/>
			</div>
			<div>
				<h3>Series</h3>
				<Row>
					<Col lg={{span: 6}}>
						<SearchEntityCreate
							isClearable={false}
							type="series"
							value={series}
							onChange={onSeriesChange}
							{...rest}
						/>
					</Col>
					<Col lg={{span: 2}}>
						{series && <Button variant="primary" onClick={onShowHandler}>Add Items</Button>}
					</Col>
				</Row>
			</div>
		</>
	);
}

function mapStateToProps(rootState:State):ContentTabStateProps {
	const worksObj = convertMapToObject(rootState.get('Works'));
	const seriesObj = convertMapToObject(rootState.getIn(['Series', 's0'], null));
	return {
		series: seriesObj,
		works: worksObj
	};
}
function mapDispatchToProps(dispatch):ContentTabDispatchProps {
	const type = 'Work';
	return {
		onChange: (value:any) => dispatch(addWork(value)),
		onModalClose: () => dispatch(loadEdition()) && dispatch(closeEntityModal()),
		onModalOpen: (id) => {
			dispatch(dumpEdition(type));
			dispatch(duplicateWork(id));
			dispatch(openEntityModal());
		},
		onSeriesChange: (value:any) => dispatch(addSeries(value)) && dispatch(removeAllSeriesItems()) &&
		value?.orderingTypeId && dispatch(updateOrderType(value.orderingTypeId)) && dispatch(updateSeriesType(value.seriesEntityType))
	};
}

export default connect<ContentTabStateProps, ContentTabDispatchProps>(mapStateToProps, mapDispatchToProps)(ContentTab);