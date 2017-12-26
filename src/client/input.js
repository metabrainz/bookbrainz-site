/*
 * Copyright (C) 2017  Ben Ockmore
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

/* eslint-disable react/require-default-props */

import {
	ControlLabel,
	FormControl,
	FormGroup,
	HelpBlock,
	InputGroup
} from 'react-bootstrap';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import cx from 'classnames';


export default class Input extends Component {
	static propTypes = {
		addonAfter: PropTypes.any,
		addonBefore: PropTypes.any,
		bsSize: PropTypes.string,
		buttonAfter: PropTypes.any,
		buttonBefore: PropTypes.any,
		children: PropTypes.any,
		groupClassName: PropTypes.string,
		hasFeedback: PropTypes.bool,
		help: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
		id: PropTypes.string,
		label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
		labelClassName: PropTypes.string,
		name: PropTypes.string,
		standalone: PropTypes.bool,
		type: PropTypes.string,
		validationState: PropTypes.string,
		wrapperClassName: PropTypes.string
	};

	constructor(props, context) {
		super(props, context);

		this.refFormControl = null;
	}

	getDOMNode() {
		return ReactDOM.findDOMNode(this.refFormControl); // eslint-disable-line react/no-find-dom-node,max-len
	}

	getValue() {
		const inputNode = this.getDOMNode();

		if (this.props.type === 'select' && inputNode.multiple) {
			return this.getMultipleSelectValues(inputNode);
		}

		return inputNode.value;
	}

	getMultipleSelectValues(selectNode) {
		const values = [];
		const {options} = selectNode;

		for (let i = 0; i < options.length; i++) {
			const opt = options[i];

			if (opt.selected) {
				values.push(opt.value || opt.text);
			}
		}

		return values;
	}

	renderAddon(addon) {
		return addon && <InputGroup.Addon>{addon}</InputGroup.Addon>;
	}

	renderButton(button) {
		return button && <InputGroup.Button>{button}</InputGroup.Button>;
	}

	renderInputGroup({
		wrapperClassName,
		addonBefore, addonAfter, buttonBefore, buttonAfter,
		help, hasFeedback,
		children, value,
		...props
	}) {
		if (props.type === 'select' || props.type === 'textarea') {
			props.componentClass = props.type;
			delete props.type;
		}

		const formControl =
			(children && React.cloneElement(children, props)) ||
			<FormControl
				ref={(ref) => { this.refFormControl = ref; }}
				value={value}
				{...props}
			/>;

		function getFormControlWrapped(className) {
			return className || hasFeedback || help ?
				(
					<div className={className}>
						{formControl}
						{hasFeedback && <FormControl.Feedback/>}
						{help && <HelpBlock>{help}</HelpBlock>}
					</div>
				) :
				formControl;
		}


		if (!addonBefore && !addonAfter && !buttonBefore && !buttonAfter) {
			return getFormControlWrapped(wrapperClassName);
		}

		return (
			<InputGroup
				bsClass={cx('input-group', wrapperClassName)}
			>
				{this.renderAddon(addonBefore)}
				{this.renderButton(buttonBefore)}
				{getFormControlWrapped()}
				{this.renderButton(buttonAfter)}
				{this.renderAddon(addonAfter)}
			</InputGroup>
		);
	}

	render() {
		const {
			id,
			label,
			bsSize,
			groupClassName,
			labelClassName,
			standalone,
			validationState,
			...props
		} = this.props;

		return (
			<FormGroup
				bsClass={cx({'form-group': !standalone}, groupClassName)}
				bsSize={bsSize}
				controlId={id}
				validationState={validationState}
			>
				{label && (
					<ControlLabel
						bsClass={cx('control-label', labelClassName)}
					>
						{label}
					</ControlLabel>
				)}
				{this.renderInputGroup(props)}
			</FormGroup>
		);
	}
}
