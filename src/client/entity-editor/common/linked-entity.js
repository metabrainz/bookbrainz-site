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

// @flow

// import Icon from 'react-fontawesome';
import React from 'react';
import {genEntityIconHTMLElement} from '../../helpers/entity';


type LinkedEntityProps = {
	disambiguation?: ?string,
	id?: string | false,
	text: string,
	type: string,
	unnamedText?: string
};

function LinkedEntity(
	{disambiguation, id, text, type, unnamedText}: LinkedEntityProps
) {
	let url = null;
	if (type) {
		url = type === 'Area' ?
			`//musicbrainz.org/area/${id}` :
			`/${type.toLowerCase()}/${id}`;
	}
	function eventHandler(event) {
		// event.preventDefault();
		// console.log(url, 'url', text);
		if (url) {
			window.open(url, '_blank');
		}
	}

	const nameComponent = text || <i>{unnamedText}</i>;
	const contents = (
		<span>
			{
				type && genEntityIconHTMLElement(type)
			}
			{' '}
			<a className="hello" onClick={eventHandler}>
				{nameComponent}
			</a>
			{
				disambiguation &&
				<span className="disambig"><small>({disambiguation})</small></span>
			}
		</span>
	);

	return contents;
}

// LinkedEntity.displayName = 'LinkedEntity';
LinkedEntity.defaultProps = {
	disambiguation: null,
	unnamedText: '(unnamed)'
};

export default LinkedEntity;
