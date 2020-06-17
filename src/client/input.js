/* eslint-disable */

import { ControlLabel, FormControl, FormGroup, HelpBlock, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import React, { Component } from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import cx from 'classnames';

export default class Input extends Component {
	static propTypes = {
		name: PropTypes.string,
		id: PropTypes.string,
		children: PropTypes.any,
		help: PropTypes.oneOfType([ PropTypes.string, PropTypes.node ]),
		bsSize: PropTypes.string,
		wrapperClassName: PropTypes.string,
		groupClassName: PropTypes.string,
		labelClassName: PropTypes.string,
		addonBefore: PropTypes.any,
		addonAfter: PropTypes.any,
		buttonBefore: PropTypes.any,
		buttonAfter: PropTypes.any,
		standalone: PropTypes.bool,
		hasFeedback: PropTypes.bool,
		validationState: PropTypes.string,
		label: PropTypes.oneOfType([ PropTypes.string, PropTypes.node ]),
		type: PropTypes.string,
		tooltipText: PropTypes.string
	};

	constructor(props, context) {
		super(props, context);

		this.refFormControl = null;
	}

	getDOMNode = () => (
		ReactDOM.findDOMNode(this.refFormControl)
	)

	getValue = () => {
		const inputNode = this.getDOMNode();

		if (this.props.type === 'select' && inputNode.multiple) {
			return this.getMultipleSelectValues(inputNode);
		}

		return inputNode.value;
	}

	getMultipleSelectValues(selectNode) {
		const values = [];
		const options = selectNode.options;

		for (let i = 0; i < options.length; i++) {
			const opt = options[i];

			if (opt.selected) {
				values.push(opt.value || opt.text);
			}
		}

		return values;
	}

	renderAddon(addon) {
		return addon && <InputGroup.Addon>{ addon }</InputGroup.Addon>;
	}

	renderButtons(buttons) {
		if (Array.isArray(buttons)){
			return buttons.map((button, index) => this.renderButton(button, index));
		}
		return this.renderButton(buttons, 0);
	}
	renderButton(button, index:number) {
		return button && <InputGroup.Button key={`btn${index}`}>{ button }</InputGroup.Button>;
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
				ref={ (c) => { this.refFormControl = c; } }
				value={ value }
				{ ...props } />;

		const getFormControlWrapped = (className) => (
			 className || hasFeedback || help ?
				(
					<div className={ className }>
						{ formControl }
						{ hasFeedback && <FormControl.Feedback /> }
						{ help && <HelpBlock>{help}</HelpBlock> }
					</div>
				) :
				formControl
				);

		if (!addonBefore && !addonAfter && !buttonBefore && !buttonAfter) {
			return getFormControlWrapped(wrapperClassName);
		}

		return (
			<InputGroup
				bsClass={ cx('input-group', wrapperClassName) }>
				{ this.renderAddon(addonBefore) }
				{ this.renderButtons(buttonBefore) }
				{ getFormControlWrapped() }
				{ this.renderButtons(buttonAfter) }
				{ this.renderAddon(addonAfter) }
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
			tooltipText,
			...props
		} = this.props;

		const helpIconElement = tooltipText && (
			<OverlayTrigger
				overlay={<Tooltip id={`tooptip-${id}`}>{tooltipText}</Tooltip>}
				delayShow={50}
			>
				<FontAwesomeIcon
					className="margin-left-0-5"
					icon="question-circle"
				/>
			</OverlayTrigger>
		);
			
		return (
			<FormGroup
				controlId={ id }
				bsSize={ bsSize }
				bsClass={ cx({ 'form-group': !standalone }, groupClassName) }
				validationState={ validationState }>
				{ label && (
					<ControlLabel
						bsClass={ cx('control-label', labelClassName) }>
						{ label }
						{ helpIconElement }
					</ControlLabel>
				) }
				{ this.renderInputGroup(props) }
			</FormGroup>
		);
	}
}
