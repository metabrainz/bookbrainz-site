/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
 *               2015       Ohm Patel
 *               2015       Ian Sanders
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

import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';


function wangleID(value, idAttribute) {
	if (_.isArray(value)) {
		return value.map(
			(aValue) => (
				_.isObject(aValue) ? aValue[idAttribute] : aValue
			)
		);
	}

	return _.isObject(value) ? value[idAttribute] : value;
}


class SelectWrapper extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: props.defaultValue
		};
		this.currentValue = this.state.value;

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(newValue) {
		this.setState({
			value: newValue
		});

		this.currentValue = newValue;

		if (this.props.onChange) {
			this.props.onChange(wangleID(newValue, this.props.idAttribute));
		}
	}

	getValue() {
		const childValue = _.isNil(this.props.value) ?
			this.currentValue : this.props.value;

		return wangleID(childValue, this.props.idAttribute);
	}

	render() {
		const {
			base,
			idAttribute,
			label,
			labelAttribute,
			labelClassName,
			multiple,
			wrapperClassName,
			value,
			...props
		} = this.props;

		const Child = base;

		const childValue = _.isNil(value) ? this.state.value : value;
		const labelClasses = classNames('control-label', labelClassName);

		return (
			<div className="form-group">
				{
					label &&
					<label className={labelClasses}>{label}</label>
				}
				<div className={wrapperClassName}>
					<Child
						labelKey={labelAttribute}
						multi={multiple}
						ref={(ref) => this.select = ref}
						value={childValue}
						valueKey={idAttribute}
						onChange={this.handleChange}
						{...props}
					/>
				</div>
			</div>
		);
	}
}
SelectWrapper.displayName = 'SelectWrapper';
SelectWrapper.propTypes = {
	base: React.PropTypes.any.isRequired,
	defaultValue: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number,
		React.PropTypes.object
	]),
	idAttribute: React.PropTypes.string.isRequired,
	label: React.PropTypes.string,
	labelAttribute: React.PropTypes.string.isRequired,
	labelClassName: React.PropTypes.string,
	multiple: React.PropTypes.bool,
	onChange: React.PropTypes.func,
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number,
		React.PropTypes.object
	]),
	wrapperClassName: React.PropTypes.string
};
SelectWrapper.defaultProps = {
	defaultValue: null,
	label: null,
	labelClassName: null,
	multiple: false,
	onChange: null,
	value: null,
	wrapperClassName: null
};

export default SelectWrapper;
