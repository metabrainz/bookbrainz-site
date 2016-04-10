/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
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

const React = require('react');
const Icon = require('react-fontawesome');

function LoadingSpinner() {
	'use strict';

	return (
		<div className="loading-background">
			<Icon
				spin
				className="loading-spinner"
				name="circle-o-notch"
				size="2x"
			/>
		</div>
	);
}

LoadingSpinner.displayName = 'LoadingSpinner';
module.exports = LoadingSpinner;
