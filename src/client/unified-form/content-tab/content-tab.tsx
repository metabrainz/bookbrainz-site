import * as Bootstrap from 'react-bootstrap/';
import {ContentTabDispatchProps, ContentTabProps, ContentTabStateProps, State} from '../interface/type';
import {addSeries, addWork, duplicateWork} from './action';
import {addSeriesItem, removeAllSeriesItems, updateOrderType, updateSeriesType} from '../../entity-editor/series-section/actions';
import {closeEntityModal, dumpEdition, loadEdition, openEntityModal} from '../action';
import {get, map, toLower} from 'lodash';
import CreateEntityModal from '../common/create-entity-modal';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import SeriesSection from '../../entity-editor/series-section/series-section';
import WorkRow from './work-row';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';


const {Row, Col, FormCheck, OverlayTrigger, FormLabel, Tooltip} = Bootstrap;
export function ContentTab({works, onChange, onModalClose, onModalOpen, onSeriesChange, series, onAddSeriesItem, ...rest}:ContentTabProps) {
	const [isChecked, setIsChecked] = React.useState(true);
	const [copyToSeries, setCopyToSeries] = React.useState(false);
	const toggleCheck = React.useCallback(() => setIsChecked(!isChecked), [isChecked]);
	const toggleCopyToSeries = React.useCallback(() => setCopyToSeries(!copyToSeries), [copyToSeries]);
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
	const baseEntity = {
		bbid: series?.id,
		defaultAlias: {
			name: series?.text
		},
		type: 'Series'
	};
	const onChangeHandler = React.useCallback((work:any) => {
		work.checked = isChecked;
		if (copyToSeries) {
			const otherEntity = {
				bbid: get(work, 'id'),
				defaultAlias: {
					name: get(work, 'text')
				},
				disambiguation: get(work, 'disambiguation'),
				type: get(work, 'type')
			};
			const relationship = {
				attributes: [{attributeType: 1, value: {textValue: null}}, {attributeType: 2, value: {textValue: null}}],
				relationshipType: {
					id: 71,
					linkPhrase: 'is part of',
					reverseLinkPhrase: 'contains',
					sourceEntityType: 'Work',
					targetEntityType: 'Series'
				},
				sourceEntity: otherEntity,
				targetEntity: baseEntity
			};
			onAddSeriesItem(relationship);
		}
		onChange(work);
	}, [isChecked, onChange, copyToSeries]);
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
		hideTypeOption: true
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
			Add Selected Works to Series
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
				<FormCheck
					className="ml-1"
					defaultChecked={copyToSeries}
					disabled={!series}
					id="works-copy-to-series"
					label={seriesWorkLabel}
					type="checkbox"
					onChange={toggleCopyToSeries}
				/>
			</div>
			<hr/>
			<div>
				<h3>Series</h3>
				<Row>
					<Col lg={{span: 6}}>
						<SearchEntityCreate
							filters={filters}
							isClearable={false}
							type="series"
							value={series}
							onChange={onSeriesChange}
							{...rest}
						/>
					</Col>
				</Row>
				{series && <SeriesSection {...seriesSectionProps}/>}
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
		onAddSeriesItem: (data) => dispatch(addSeriesItem(data)),
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
