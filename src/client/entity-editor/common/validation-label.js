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

// @flow

import * as React from 'react';
import Icon from 'react-fontawesome';


function icon(empty: ?boolean, error: ?boolean, warn: ?boolean): string | null {
	if (empty) {
		return null;
	}

	if (error) {
		return 'times';
	}

	if (warn) {
		return 'exclamation-triangle';
	}

	return 'check';
}

function contextualColor(
	empty: ?boolean,
	error: ?boolean,
	warn: ?boolean
): string | null {
	if (empty) {
		return null;
	}

	if (error) {
		return 'text-danger';
	}

	if (warn) {
		return 'text-warning';
	}

	return 'text-success';
}

type Props = {
	children?: React.Node,
	empty?: boolean,
	error?: boolean,
	warn?: boolean
};

/**
 * Presentational component. This component renders a textual label, intended
 * to be used with an input. Some formatting is applied and an icon is chosen
 * based on the validation state passed in via the component properties.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {node} props.children - The element or value to display within the
 *        label.
 * @param {boolean} props.empty - A flag indicating whether the associated
 *        input is empty.
 * @param {boolean} props.error - A flag indicating whether there has been an
 *        error validating the contents of the associated input field.
 * @returns {Object} A React component containing the rendered input.
 */
function ValidationLabel({
	children,
	empty,
	error,
	warn
}: Props) {
	const iconElement = icon(empty, error, warn) &&
		<Icon className="margin-left-0-5" name={icon(empty, error, warn)}/>;

	return (
		<span className={contextualColor(empty, error, warn)}>
			{children}
			{iconElement}
		</span>
	);
}
ValidationLabel.displayName = 'ValidationLabel';
ValidationLabel.defaultProps = {
	children: null,
	empty: false,
	error: false,
	warn: false
};

export default ValidationLabel;
