import * as React from 'react';

// eslint-disable-next-line import/named
import {Form, InputGroup, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';


type Props = {
	addonAfter?: any,
	addonBefore?: any,
	buttonAfter?: any,
	buttonBefore?: any,
	children?: React.ReactElement,
	groupClassName?: string,
	help?: React.ReactNode,
	id?: string,
	label?: React.ReactNode,
	labelClassName?: string,
	tooltipText?: string | React.ReactElement,
	type?: string,
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
	children?: React.ReactElement,
	value?: string,
	[propName: string]: any
};

export default class Input extends React.Component<Props> {
	static propTypes = {
		addonAfter: PropTypes.any,
		addonBefore: PropTypes.any,
		buttonAfter: PropTypes.any,
		buttonBefore: PropTypes.any,
		children: PropTypes.any,
		groupClassName: PropTypes.string,
		help: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
		id: PropTypes.string,
		label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
		labelClassName: PropTypes.string,
		tooltipText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
		type: PropTypes.string,
		wrapperClassName: PropTypes.string
	};

	static defaultProps = {
		addonAfter: null,
		addonBefore: null,
		buttonAfter: null,
		buttonBefore: null,
		children: null,
		groupClassName: null,
		help: null,
		id: null,
		label: null,
		labelClassName: null,
		tooltipText: null,
		type: null,
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

	renderPrepend(addon, buttons) {
		if (!addon && !buttons) {
			return null;
		}

		return (
			<InputGroup.Prepend>
				{addon && <InputGroup.Text>{addon}</InputGroup.Text>}
				{buttons}
			</InputGroup.Prepend>
		);
	}

	renderAppend(addon, buttons) {
		if (!addon && !buttons) {
			return null;
		}

		return (
			<InputGroup.Append>
				{addon && <InputGroup.Text>{addon}</InputGroup.Text>}
				{buttons}
			</InputGroup.Append>
		);
	}

	renderInputGroup({
		wrapperClassName,
		addonBefore, addonAfter, buttonBefore, buttonAfter,
		help, children, value,
		...props
	}: IGProps) {
		if (props.type === 'select' || props.type === 'textarea') {
			props.as = props.type;
			delete props.type;
		}

		const formControl =
			(children && React.cloneElement(children, props)) ||
			<Form.Control
				/* eslint-disable-next-line react/jsx-no-bind */
				ref={(ref: HTMLInputElement) => { this.refFormControl = ref; }}
				value={value}
				{...props}
			/>;

		function getFormControlWrapped(className?: string | null | undefined) {
			return className || help ?
				(
					<div className={className}>
						{formControl}
						{help && <Form.Text muted>{help}</Form.Text>}
					</div>
				) :
				formControl;
		}

		if (!addonBefore && !addonAfter && !buttonBefore && !buttonAfter) {
			return getFormControlWrapped(wrapperClassName);
		}

		return (
			<InputGroup className={wrapperClassName}>
				{this.renderPrepend(addonBefore, buttonBefore)}
				{getFormControlWrapped()}
				{this.renderAppend(addonAfter, buttonAfter)}
			</InputGroup>
		);
	}

	render() {
		const {
			id,
			label,
			groupClassName,
			labelClassName,
			tooltipText,
			...props
		} = this.props;

		const helpIconElement = tooltipText && (
			<OverlayTrigger
				delay={50}
				overlay={<Tooltip id={`tooltip-${id}`}>{tooltipText}</Tooltip>}
			>
				<FontAwesomeIcon
					className="margin-left-0-5"
					icon={faQuestionCircle}
				/>
			</OverlayTrigger>
		);

		return (
			<Form.Group
				className={groupClassName}
				controlId={id}
			>
				{label && (
					<Form.Label className={labelClassName}>
						{label}
						{helpIconElement}
					</Form.Label>
				)}
				{this.renderInputGroup(props)}
			</Form.Group>
		);
	}
}
