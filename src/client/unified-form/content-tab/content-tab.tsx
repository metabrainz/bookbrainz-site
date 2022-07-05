import * as Bootstrap from 'react-bootstrap/';
import {ContentTabDispatchProps, ContentTabProps, ContentTabStateProps, State} from '../interface/type';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import WorkRow from './work-row';
import {addWork} from './action';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {map} from 'lodash';


const {Row, Col, FormCheck} = Bootstrap;
export function ContentTab({value, onChange, ...rest}:ContentTabProps) {
	const [isChecked, setIsChecked] = React.useState(false);
	const toggleIsChecked = React.useCallback(() => setIsChecked(!isChecked), [isChecked]);
	const onChangeHandler = React.useCallback((work:any) => {
		work.checked = isChecked;
		onChange(work);
	}, [isChecked, onChange]);
	return (
		<>
			<h3>Works</h3>
			{map(value, (work, rowId) => <WorkRow key={rowId} rowId={rowId} {...rest}/>)}
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
				label="Copy authors from AC"
				type="checkbox"
				onChange={toggleIsChecked}
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
	return {
		onChange: (value:any) => dispatch(addWork(value))
	};
}

export default connect<ContentTabStateProps, ContentTabDispatchProps>(mapStateToProps, mapDispatchToProps)(ContentTab);
