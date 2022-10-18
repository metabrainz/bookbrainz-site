import * as Bootstrap from 'react-bootstrap/';
import {WorkRowDispatchProps, WorkRowProps, WorkRowStateProps} from '../interface/type';
import {removeWork, toggleCheck, updateWork} from './action';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';


const {Row, Col, Button, FormCheck, ButtonGroup, Tooltip, OverlayTrigger, FormLabel} = Bootstrap;

function WorkRow({onChange, work, onRemove, onToggle, onCopyHandler, rowId, ...rest}:WorkRowProps) {
	const isChecked = work?.checked;
	const handleCopy = React.useCallback(() => onCopyHandler(rowId), [onCopyHandler, work]);
	const onChangeHandler = React.useCallback((value:any) => {
		value.checked = isChecked;
		onChange(value);
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
		<div className="work-item">
			<Row>
				<Col lg={{span: 6}}>
					<SearchEntityCreate
						isClearable={false}
						type="work"
						value={work}
						onChange={onChangeHandler}
						{...rest}
					/>
				</Col>
				<Col lg={{span: 2}}>
					<ButtonGroup>
						<Button variant="primary" onClick={handleCopy as React.MouseEventHandler}>Duplicate</Button>
						<Button variant="danger" onClick={onRemove}>Remove</Button>
					</ButtonGroup>
				</Col>
			</Row>
			<FormCheck
				className="ml-1 mb-2"
				defaultChecked={isChecked}
				id={work.id}
				label={checkLabel}
				type="checkbox"
				onChange={onToggle}
			/>
		</div>
		 );
}

function mapStateToProps(state, {rowId}) {
	return {
		work: convertMapToObject(state.getIn(['Works', rowId]))
	};
}


function mapDispatchToProps(dispatch, {rowId}) {
	return {
		onChange: (value:any) => dispatch(updateWork(rowId, value)),
		onRemove: () => dispatch(removeWork(rowId)),
		onToggle: () => dispatch(toggleCheck(rowId))
	};
}

export default connect<WorkRowStateProps, WorkRowDispatchProps>(mapStateToProps, mapDispatchToProps)(WorkRow);
