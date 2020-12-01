import * as React from 'react';

// eslint-disable-next-line import/named
import {ControlLabel, FormControl, FormGroup, HelpBlock, InputGroup, OverlayTrigger, Sizes, Tooltip} from 'react-bootstrap';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import cx from 'classnames';


type Props = {
	addonAfter?: any,
	addonBefore?: any,
	bsSize?: Sizes,
	buttonAfter?: any,
	buttonBefore?: any,
	children?: React.ReactElement,
	groupClassName?: string,
	hasFeedback?: boolean,
	help?: React.ReactNode,
	id?: string,
	label?: React.ReactNode,
	labelClassName?: string,
	name?: string,
	standalone?: boolean,
	tooltipText?: string,
	type?: string,
	validationState?: 'success' | 'warning' | 'error' | null,
	wrapperClassName?: string,
	value?: string,
	[propName: string]: any
};

type IGProps = {
	wrapperClassName?: string,
	addonBefore?: any,
	addonAfter?: any,
	buttonBefore?: any,
	buttonAfter?: any,
	help?: React.ReactNode,
	hasFeedback?: boolean,
	children?: React.ReactElement,
	value?: string,
	[propName: string]: any
};

export default class Input extends React.Component<Props> {
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

	constructor(props, context) {
		super(props, context);

		this.refFormControl = null;
	}

	refFormControl: HTMLInputElement;

	// eslint-disable-next-line accessor-pairs
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
	}: IGProps) {
		if (props.type === 'select' || props.type === 'textarea') {
			props.componentClass = props.type;
			delete props.type;
		}

		const formControl =
			(children && React.cloneElement(children, props)) ||
			<FormControl
				/* eslint-disable-next-line react/jsx-no-bind */
				inputRef={(ref: HTMLInputElement) => { this.refFormControl = ref; }}
				value={value}
				{...props}
			/>;

		function getFormControlWrapped(className?: string | null | undefined) {
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
