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


import Icon from 'react-fontawesome';
import React from 'react';


function icon(empty, error) {
	if (empty) {
		return null;
	}

	if (error) {
		return 'times';
	}

	return 'check';
}


function contextualColor(empty, error) {
	if (empty) {
		return null;
	}

	if (error) {
		return 'text-danger';
	}

	return 'text-success';
}


function ValidationLabel({
	children,
	empty,
	error
}) {
	const iconElement = icon(empty, error) &&
		<Icon className="margin-left-0-5" name={icon(empty, error)}/>;

	return (
		<span className={contextualColor(empty, error)}>
			{children}
			{iconElement}
		</span>
	);
}
ValidationLabel.displayName = 'ValidationLabel';
ValidationLabel.propTypes = {
	children: React.PropTypes.node,
	empty: React.PropTypes.bool,
	error: React.PropTypes.bool
};

export default ValidationLabel;
