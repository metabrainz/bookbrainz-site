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
import FontAwesome from 'react-fontawesome';
import React from 'react';
import {genEntityIconHTMLElement} from '../../helpers/entity';


type LinkedEntityProps = {
	children: PropTypes.node,
	className: PropTypes.string,
	isDisabled: PropTypes.bool,
	isFocused: PropTypes.bool,
	innerProps: any,
	isSelected: PropTypes.bool,
	onFocus: PropTypes.func,
	onSelect: PropTypes.func,
	option: PropTypes.object.isRequired,
};

function LinkedEntity(
	{onSelect, option}: LinkedEntityProps
) {
	const {disambiguation, id, text, type, unnamedText, language} = option;
	console.log(option);
	let url = null;
	if (type) {
		url = type === 'Area' ?
			`//musicbrainz.org/area/${id}` :
			`/${type.toLowerCase()}/${id}`;
	}
	function parentEventHandler(event) {
		onSelect(option, event);
	}
	function childEventHandler(event) {
		event.stopPropagation();
		event.preventDefault();
		// console.log(url, 'url', text);
		if (url) {
			window.open(url, '_blank');
		}
	}

	const nameComponent = text || <i>{unnamedText}</i>;
	const contents = (
		<div className="react-select__value-container" style={{cursor: 'pointer', fontSize: '15px', padding: '8px'}} onClick={parentEventHandler}>
			{
				type && genEntityIconHTMLElement(type)
			}
			&nbsp;
			{nameComponent}{language}
			&nbsp;&nbsp;
			{
				disambiguation &&
				<span className="disambig"><small>({disambiguation})</small></span>
			}
			{' '}
			<a onClick={childEventHandler}>
				<FontAwesome name="external-link-alt"/>
			</a>
		</div>
	);

	return contents;
}

// LinkedEntity.displayName = 'LinkedEntity';
LinkedEntity.defaultProps = {
	disambiguation: null,
	unnamedText: '(unnamed)'
};

export default LinkedEntity;
