import * as Bootstrap from 'react-bootstrap/';
import {ContentTabDispatchProps, ContentTabProps, ContentTabStateProps, State} from '../interface/type';
import React from 'react';
import SearchEntityCreate from '../common/search-entity-create-select';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {reduce} from 'lodash';
import {updateWorks} from './action';


const {Row, Col} = Bootstrap;
export function ContentTab({value, onChange, nextId, ...rest}:ContentTabProps) {
	return (
		<Row>
			<Col lg={{span: 6}}>
				<SearchEntityCreate
					isMulti
					label="Works"
					nextId={nextId}
					type="work"
					value={value}
					onChange={onChange}
					{...rest}
				/>
			</Col>
		</Row>
		 );
}

function mapStateToProps(rootState:State) {
	const worksObj = convertMapToObject(rootState.get('Works'));
	// get next id for new work
	const nextId = reduce(worksObj, (prev, value) => (value.__isNew__ ? prev + 1 : prev), 0);
	return {
		nextId,
		value: Object.values(worksObj)
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onChange: (options:any[]) => {
			const mappedOptions = Object.fromEntries(options.map((value, index) => {
				value.__isNew__ = Boolean(value.__isNew__);
				return [`w${index}`, value];
			}));
			return dispatch(updateWorks(mappedOptions));
		}
	};
}

export default connect<ContentTabStateProps, ContentTabDispatchProps>(mapStateToProps, mapDispatchToProps)(ContentTab);
