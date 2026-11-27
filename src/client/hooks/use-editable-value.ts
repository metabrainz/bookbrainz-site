/*
 * Copyright (C) 2026  Ansh Goyal
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

import {type Dispatch, type SetStateAction, useState} from 'react';


// A value the user can edit, which starts over when the value it comes from changes
export function useEditableValue<Value>(value: Value): [Value, Dispatch<SetStateAction<Value>>] {
	const [editedValue, setEditedValue] = useState(value);
	// React's way to adjust state while rendering, without an effect
	const [sourceValue, setSourceValue] = useState(value);
	if (value !== sourceValue) {
		setSourceValue(value);
		setEditedValue(value);
	}
	return [editedValue, setEditedValue];
}
