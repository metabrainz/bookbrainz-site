/*
 * Copyright (C) 2015  Ohm Patel
 *               2016  Sean Burke
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

import * as bootstrap from 'react-bootstrap';

import {type EntityIconType, genEntityIconHTMLElement} from '../../../helpers/entity-icon';
import {Trans, useTranslation} from 'react-i18next';
import React from 'react';
import {camelCase} from 'lodash';


const {Button, ButtonGroup} = bootstrap;

const entityTypes: EntityIconType[] = ['Author', 'Work', 'Edition', 'Series', 'Publisher'];

// Links to the pages that create an entity of each type, seeded with the name that was searched for
export default function CallToAction({query = ''}: {query?: string}) {
	const {t: translate} = useTranslation();
	const seedingParameters = new URLSearchParams({name: query});
	function renderEntityLink(type: EntityIconType) {
		return (
			<Button
				className="padding-bottom-1 padding-sides-2 padding-top-1"
				href={`/${camelCase(type)}/create?${seedingParameters}`}
				key={type}
				variant="secondary"
			>
				{genEntityIconHTMLElement(type, '3x', false)}
				<div className="margin-top-d4">{translate(`common.entityType.${camelCase(type)}`)}</div>
			</Button>
		);
	}
	return (
		<div className="text-center">
			<p>
				{translate('pages.callToAction.helpText')}
				<br/>
				<small>
					<Trans
						components={{helpLink: <a href="/help"/>}}
						i18nKey="pages.callToAction.notSure"
					/>
				</small>
			</p>
			<div>
				<ButtonGroup id="searchpage-button-group d-inline">
					{entityTypes.map(renderEntityLink)}
				</ButtonGroup>
			</div>
		</div>
	);
}
