// @flow

import {ControlLabel, FormControl, FormGroup, HelpBlock, InputGroup, OverlayTrigger, Tooltip} from 'react-bootstrap';
import React, {Component} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import cx from 'classnames';


export default class Input extends Component {
	static defaultProps = {
		addonAfter: null,
		addonBefore: null,
		bsSize: null,
		buttonAfter: null,
		buttonBefore: null,
		children: null,
		groupClassName: null,
		hasFeedback: null,
		help: null,
		id: null,
		label: null,
		labelClassName: null,
		name: null,
		standalone: false,
		tooltipText: null,
		type: null,
		validationState: null,
		wrapperClassName: null
	};

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
		tooltipText: PropTypes.string,
		type: PropTypes.string,
		validationState: PropTypes.string,
		wrapperClassName: PropTypes.string
	};

	constructor(props, context) {
		super(props, context);

		this.refFormControl = null;
	}

	set value(newValue) {
		this.refFormControl.value = newValue;
	}

	getValue = () => {
		const inputNode = this.refFormControl;

		if (this.props.type === 'select' && inputNode.multiple) {
			return this.getMultipleSelectValues(inputNode);
		}

		return inputNode.value;
	};

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

	renderButtons(buttons) {
		if (Array.isArray(buttons)) {
			return buttons.map((button, index) => this.renderButton(button, index));
		}

		return this.renderButton(buttons, 0);
	}

	renderButton(button, index: number) {
		return button && <InputGroup.Button key={`btn${index}`}>{button}</InputGroup.Button>;
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
				/* eslint-disable-next-line react/jsx-no-bind */
				inputRef={(ref) => { this.refFormControl = ref; }}
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
				{this.renderButtons(buttonBefore)}
				{getFormControlWrapped()}
				{this.renderButtons(buttonAfter)}
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
			tooltipText,
			...props
		} = this.props;

		const helpIconElement = tooltipText && (
			<OverlayTrigger
				delayShow={50}
				overlay={<Tooltip id={`tooltip-${id}`}>{tooltipText}</Tooltip>}
			>
				<FontAwesomeIcon
					className="margin-left-0-5"
					icon="question-circle"
				/>
			</OverlayTrigger>
		);

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
						{helpIconElement}
					</ControlLabel>
				)}
				{this.renderInputGroup(props)}
			</FormGroup>
		);
	}
}
