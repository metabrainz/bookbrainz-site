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


import * as React from 'react';
import {Form, OverlayTrigger, Tooltip} from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {OptionProps} from 'react-select/src/components/Option';
import ValidationLabel from './validation-label';
import {components} from 'react-select';
import {convertMapToObject} from '../../helpers/utils';
import createFilterOptions from 'react-select-fast-filter-options';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';
import {freezeObjects} from '../../unified-form/common/freezed-objects';
import {isNumber} from 'lodash';


function OptimizedOption(props: OptionProps<any, any>) {
	delete props.innerProps.onMouseMove;
	delete props.innerProps.onMouseOver;
	return <components.Option {...props}>{props.children}</components.Option>;
}

type Props = {
	empty?: boolean,
	error?: boolean,
	tooltipText?: string,
	[propName: string]: any
};

/**
 * Presentational component. This component renders a dropdown selection box
 * allowing the user to select from a list of provided language options. The
 * input is labelled with a ValidationLabel containing the text 'Language'.
 *
 * @param {Object} props - The properties passed to the component, which are
 *        then passed to the underlying VirtualizedSelect component.
 * @param {boolean} props.error - Passed to the ValidationLabel within the
 *        component to indicate a validation error.
 * @param {boolean} props.empty - Passed to the ValidationLabel within the
 *        component to indicate that the field is empty.
 * @returns {Object} A React component containing the rendered input.
 */
function LanguageField({
	empty,
	error,
	tooltipText,
	...rest
}: Props) {
	const label =
		<ValidationLabel empty={empty} error={error}>Language</ValidationLabel>
	;
	const MAX_DROPDOWN_OPTIONS = 20;
	const MAX_F1_OPTIONS = 400;
	const tooltip = <Tooltip id="language-tooltip">{tooltipText}</Tooltip>;
	rest.options = convertMapToObject(rest.options);
	const {value, options} = rest;
	const filterOptions = freezeObjects.filterOptions ?? React.useMemo(() => createFilterOptions({options}), []);
	const sortFilterOptions = (opts, input, selectOptions) => {
		const newOptions = filterOptions(opts, input, selectOptions).slice(0, MAX_DROPDOWN_OPTIONS);
		const sortLang = (a, b) => {
			if (isNumber(a.frequency) && isNumber(b.frequency) && a.frequency !== b.frequency) {
				return b.frequency - a.frequency;
			}
			return a.label.localeCompare(b.label);
		};
		newOptions.sort(sortLang);
		return newOptions;
	};
	const f2Languages = options.filter((lang) => lang.frequency === 2);
	const f1Languages = options.filter((lang) => lang.frequency === 1).slice(0, MAX_F1_OPTIONS);
	const defaultOptions = [{
		label: 'Frequently Used',
		options: f2Languages
	},
	{
		label: 'Other',
		options: f1Languages
	}];
	const fetchOptions = React.useCallback((input) => Promise.resolve(sortFilterOptions(options, input, value)), []);
	return (
		<Form.Group>
			<Form.Label>
				{label}
				<OverlayTrigger delay={50} overlay={tooltip}>
					<FontAwesomeIcon
						className="margin-left-0-5"
						icon={faQuestionCircle}
					/>
				</OverlayTrigger>
			</Form.Label>
			<AsyncSelect
				cacheOptions
				isClearable
				className="Select"
				classNamePrefix="react-select"
				components={{Option: OptimizedOption}}
				defaultOptions={defaultOptions} loadOptions={fetchOptions} placeholder="Search language" {...rest}
			/>
		</Form.Group>
	);
}
LanguageField.displayName = 'LanguageField';
LanguageField.defaultProps = {
	empty: false,
	error: false,
	tooltipText: null
};

function areEqual(prevProps, nextProps) {
	return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}
export default React.memo(LanguageField, areEqual);
