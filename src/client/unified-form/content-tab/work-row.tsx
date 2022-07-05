import * as Bootstrap from 'react-bootstrap/';
import {removeWork, toggleCheck, updateWork} from './action';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';


const {Row, Col, Button, FormCheck} = Bootstrap;
type WorkRowStateProps = {
    work: any;
};
type WorkRowDispatchProps = {
    onChange: (value:any) => void;
    onRemove: () => void;
	onToggle: () => void;
};

type WorkRowOwnProps = {
    rowId: string;
};

type WorkRowProps = WorkRowStateProps & WorkRowDispatchProps & WorkRowOwnProps;

function WorkRow({onChange, work, onRemove, onToggle, ...rest}:WorkRowProps) {
	const isChecked = work?.checked;
	const onChangeHandler = React.useCallback((value:any) => {
		value.checked = isChecked;
		onChange(value);
	}, [isChecked, onChange]);
	// TODO: Add author to exisiting work from AC
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
					<Button variant="danger" onClick={onRemove}>Remove</Button>
				</Col>
			</Row>
			{work.__isNew__ && <FormCheck
				className="ml-1 mb-2"
				defaultChecked={isChecked}
				label="Copy authors from AC"
				type="checkbox"
				onChange={onToggle}
			                   />}
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
