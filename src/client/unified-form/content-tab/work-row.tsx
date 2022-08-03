import * as Bootstrap from 'react-bootstrap/';
import {WorkRowDispatchProps, WorkRowProps, WorkRowStateProps} from '../interface/type';
import {removeWork, toggleCheck, updateWork} from './action';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';


const {Row, Col, Button, FormCheck, ButtonGroup} = Bootstrap;

function WorkRow({onChange, work, onRemove, onToggle, onCopyHandler, ...rest}:WorkRowProps) {
	const isChecked = work?.checked;
	const handleCopy = React.useCallback(() => onCopyHandler(work.id), [onCopyHandler, work]);
	const onChangeHandler = React.useCallback((value:any) => {
		value.checked = isChecked;
		onChange(value);
	}, [isChecked, onChange]);
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
						{
							work.__isNew__ && <Button variant="primary" onClick={handleCopy as React.MouseEventHandler}>Copy</Button>
						}
						<Button variant="danger" onClick={onRemove}>Remove</Button>
					</ButtonGroup>
				</Col>
			</Row>
			<FormCheck
				className="ml-1 mb-2"
				defaultChecked={isChecked}
				id={work.id}
				label="Copy authors from AC for this work"
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
