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

import Icon from 'react-fontawesome';
import React from 'react';
import {genEntityIconHTMLElement} from '../../helpers/entity';


type EntityProps = {
	disambiguation?: ?string,
	link?: string | false,
	text: string,
	type: string,
	unnamedText?: string
};

function Entity(
	{disambiguation, link, text, type, unnamedText}: EntityProps
) {
	const nameComponent = text || <i>{unnamedText}</i>;
	const contents = (
		<span>
			{
				type && genEntityIconHTMLElement(type)
			}
			{' '}
			{nameComponent}
			{
				disambiguation &&
				<span className="disambig">{disambiguation}</span>
			}
		</span>
	);

	if (link) {
		return <a href={link}>{contents}</a>;
	}

	return contents;
}

// Entity.displayName = 'Entity';
Entity.defaultProps = {
	disambiguation: null,
	link: false,
	unnamedText: '(unnamed)'
};

export default Entity;
