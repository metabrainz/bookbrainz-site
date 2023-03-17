import * as Bootstrap from 'react-bootstrap/';
import {ContentTabDispatchProps, ContentTabProps, ContentTabStateProps, State} from '../interface/type';
import {addBulkSeriesItems, addSeriesItem, removeAllSeriesItems, updateOrderType, updateSeriesType} from '../../entity-editor/series-section/actions';
import {addSeries, addWork, duplicateWork, removeSeries} from './action';
import {closeEntityModal, dumpEdition, loadEdition, openEntityModal} from '../action';
import {forEach, get, map, size, toLower} from 'lodash';
import CreateEntityModal from '../common/create-entity-modal';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import SeriesSection from '../../entity-editor/series-section/series-section';
import WorkRow from './work-row';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {submitSingleEntity} from '../../entity-editor/submission-section/actions';


const {Row, Col, FormCheck, OverlayTrigger, FormLabel, Tooltip} = Bootstrap;
let workSeriesItemId = 0;
const seriesWorkTypeId = 71;
function getRelEntity(entity) {
	return {
		bbid: get(entity, 'bbid'),
		defaultAlias: {
			name: get(entity, 'name')
		},
		disambiguation: get(entity, 'disambiguation'),
		type: get(entity, 'type')
	};
}
function generateRel(workEntity, seriesEntity, attributeSetId?, isAdded = false, isRemoved = false) {
	return {
		attributeSetId,
		attributes: [{attributeType: 1, value: {textValue: null}}, {attributeType: 2, value: {textValue: null}}],
		isAdded,
		isRemoved,
		relationshipType: {
			id: seriesWorkTypeId,
			linkPhrase: 'is part of',
			reverseLinkPhrase: 'contains',
			sourceEntityType: 'Work',
			targetEntityType: 'Series'
		},
		rowID: `ws${workSeriesItemId++}`,
		sourceEntity: workEntity,
		targetEntity: seriesEntity
	};
}
export function ContentTab({works, onChange, onModalClose, onModalOpen, onSeriesChange, series,
	 onAddSeriesItem, onSubmitWork, resetSeries, bulkAddSeriesItems, ...rest}:ContentTabProps) {
	const [isChecked, setIsChecked] = React.useState(true);
	const [copyToSeries, setCopyToSeries] = React.useState(false);
	const toggleCheck = React.useCallback(() => {
		setIsChecked(!isChecked);
	}, [isChecked]);
	function addAllWorks(seriesEntity = series) {
		const baseEntity = getRelEntity(seriesEntity);
		const relationships = {};
		forEach(works, (work) => {
			const rel = generateRel(getRelEntity(work), baseEntity, null, true);
			relationships[rel.rowID] = rel;
		});
		bulkAddSeriesItems(relationships);
	}
	const addWorkItem = React.useCallback((workEntity) => {
		const baseEntity = getRelEntity(series);
		const otherEntity = getRelEntity(workEntity);
		const relationship = generateRel(otherEntity, baseEntity, null, true);
		onAddSeriesItem(relationship);
	}, [series, onAddSeriesItem]);
	const addNewSeriesCallback = React.useCallback((seriesEntity) => {
		resetSeries(true);
		addAllWorks(seriesEntity);
	}, [series, addAllWorks, works]);
	const addNewWorkCallback = React.useCallback((workEntity) => {
		if (copyToSeries) {
			addWorkItem(workEntity);
		}
	}, [series, addWorkItem, copyToSeries]);
	const toggleCopyToSeries = React.useCallback(() => {
		if (copyToSeries) {
			 resetSeries();
		}
		else {
			addAllWorks();
		}
		setCopyToSeries(!copyToSeries);
	}, [copyToSeries, series, works]);
	const seriesChangeHandler = React.useCallback((value) => {
		onSeriesChange(value);
		addAllWorks(value);
	}, [onSeriesChange, addAllWorks]);
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
		onSubmitWork();
		onModalClose();
	}, []);
	const onChangeHandler = React.useCallback((work:any) => {
		work.checked = isChecked;
		if (copyToSeries) {
			addWorkItem(work);
		}
		onChange(work);
	}, [isChecked, onChange, copyToSeries, series]);
	const checkToolTip = (
		<Tooltip id="work-check">This will set the book&apos;s Author Credits from the &lsquo;Cover&lsquo; tab as this Work&apos;s
	 Author
		</Tooltip>);
	const seriesSectionProps = {
		...rest,
		entity: {
			bbid: series?.id
		},
		entityType: 'series',
		hideItemSelect: true
	};
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
	const seriesWorkLabel = (

		<>
			<FormLabel className="font-weight-normal">
			Add Works to Series
				<OverlayTrigger
					delay={50}
					overlay={<Tooltip id="series-work">This will automatically add each new selected work to series items (if present)</Tooltip>}
				>
					<FontAwesomeIcon
						className="margin-left-0-5"
						icon={faInfoCircle}
					/>
				</OverlayTrigger>
			</FormLabel>
		</>

	);
	const filterSeries = React.useCallback((item) => toLower(item.entityType) === 'work', []);
	const filters = [filterSeries];
	return (
		<>
			<div>
				<h3>Works</h3>
				{map(works, (_, rowId) => <WorkRow key={rowId} rowId={rowId} onCopyHandler={openModalHandler} {...rest}/>)}
				<CreateEntityModal handleClose={closeModalHandler} handleSubmit={submitModalHandler} show={showModal} type="work" {...rest}/>
				<Row>
					<Col lg={{span: 6}}>
						<SearchEntityCreate
							isClearable={false}
							type="work"
							value={null}
							onAddCallback={addNewWorkCallback}
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
			<hr/>
			<div>
				<h3>Series</h3>
				<p className="text-muted">You can add all the Works above to an existing or new series if they are part of the
					 same a set or sequence of related Works.
					 Check the checkbox below to add the Works to a Series
				</p>
				<FormCheck
					className="ml-1 mb-2"
					defaultChecked={copyToSeries}
					id="works-copy-to-series"
					label={seriesWorkLabel}
					type="checkbox"
					onChange={toggleCopyToSeries}
				/>
				{copyToSeries &&
				<Row>
					<Col lg={{span: 6}}>
						<SearchEntityCreate
							filters={filters}
							isClearable={false}
							type="series"
							value={series}
							onAddCallback={addNewSeriesCallback}
							onChange={seriesChangeHandler}
							onOpenCallback={resetSeries}
							{...rest}
						/>
					</Col>
				</Row>}
				{copyToSeries && <SeriesSection {...seriesSectionProps}/>}
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
function mapDispatchToProps(dispatch, {submissionUrl}):ContentTabDispatchProps {
	const type = 'Work';
	return {
		bulkAddSeriesItems: (data) => dispatch(addBulkSeriesItems(data)),
		onAddSeriesItem: (data) => dispatch(addSeriesItem(data, data.rowID)),
		onChange: (value:any) => dispatch(addWork(value)),
		onModalClose: () => dispatch(loadEdition()) && dispatch(closeEntityModal()),
		onModalOpen: (id) => {
			dispatch(dumpEdition(type));
			dispatch(duplicateWork(id));
			dispatch(openEntityModal());
		},
		onSeriesChange: (value:any) => {
			dispatch(addSeries(value));
			dispatch(removeAllSeriesItems());
			if (value?.orderingTypeId) {
				dispatch(updateOrderType(value.orderingTypeId));
				dispatch(updateSeriesType(value.seriesEntityType));
			}
			// add all existing work rels to series items
			if (value?.relationshipSet) {
				const relationships = value.relationshipSet.relationships.reduce((obj, rel) => {
					if (rel.type.id === seriesWorkTypeId) {
						const workRel = generateRel(getRelEntity(rel.source), getRelEntity(rel.target), rel.attributeSetId);
						obj[workRel.rowID] = workRel;
					}
					return obj;
				}, {});
				if (size(relationships) > 0) {
					dispatch(addBulkSeriesItems(relationships));
				}
			}
		},
		onSubmitWork: () => dispatch(submitSingleEntity(submissionUrl, 'Work', addWork)),
		resetSeries: (itemsOnly = false) => dispatch(removeAllSeriesItems()) && !itemsOnly && dispatch(removeSeries())
	};
}

export default connect<ContentTabStateProps, ContentTabDispatchProps>(mapStateToProps, mapDispatchToProps)(ContentTab);
