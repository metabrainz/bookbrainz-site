/*
 * Copyright (C) 2015-2017  Ben Ockmore
 *               2015-2016  Sean Burke
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
import {Iterable} from 'immutable';
import _ from 'lodash';
import {isIterable} from '../../../types';


function makeImmutable<T extends Record<string, unknown>>(WrappedComponent: React.ComponentType<T>): React.FC<T> {
	function immutableComponent(
		propsIm: T
	): React.ReactElement {
		const propsJS = _.mapValues(
			propsIm,
			(value) => (isIterable(value) ? value.toJS() : value)
		);

		return <WrappedComponent {...propsJS}/>;
	}

	immutableComponent.displayName = 'pureJS.immutableComponent';
	return immutableComponent;
}

export default makeImmutable;
