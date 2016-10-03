/*
 * Copyright (C) 2016  Ben Ockmore
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {Input} from 'react-bootstrap';

import React from 'react';
import Select from 'react-select';
import {connect} from 'react-redux';
import {updateIdentifierType} from '../actions';


function TypeField({
	...props
}) {
	return (
		<Input label="Type">
			<Select {...props}/>
		</Input>
	);
}
TypeField.displayName = 'TypeField';

function mapStateToProps(rootState, {index}) {
	const state = rootState.get('identifierEditor');
	return {
		value: state.getIn([index, 'type'])
	};
}

function mapDispatchToProps(dispatch, {index}) {
	return {
		onChange: (value) => dispatch(updateIdentifierType(index, value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(TypeField);
