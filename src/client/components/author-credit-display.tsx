/*
 * Copyright (C) 2020  Sean Burke
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

import {map as _map, sortBy} from 'lodash';
import {AuthorCreditRow} from '../entity-editor/author-credit-editor/actions';
import React from 'react';


function AuthorCreditDisplay({names}:{names:AuthorCreditRow[]}) {
	const nameElements = _map(sortBy(names, 'position'), (name) => {
		const authorBBID = name.authorBBID ?? name.author?.id;
		return (
			<span key={`author-credit-${authorBBID}`}>
				<a href={`/author/${authorBBID}`}>
					{name.name}
				</a>
				{name.joinPhrase}
			</span>
		);
	});

	return (
		<span>
			{nameElements}
		</span>
	);
}

AuthorCreditDisplay.displayName = 'AuthorCreditDisplay';

export default AuthorCreditDisplay;
