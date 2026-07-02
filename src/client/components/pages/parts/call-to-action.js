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

import {PropTypes} from 'prop-types';
import React from 'react';
import {camelCase} from 'lodash';
import {genEntityIconHTMLElement} from '../../../helpers/entity';
import {useTranslation} from 'react-i18next';


const {Button, ButtonGroup} = bootstrap;

/**
 * Renders the document and displays 'CallToAction' component.
 * @returns {ReactElement} a HTML document which displays
 * @param {object} props - Properties passed to the component.
 * the 'CallToAction' component.
 */
function CallToAction(props) {
	const {t: translate} = useTranslation(['pages', 'common']);
	const seedingParameters = new URLSearchParams({name: props.query});
	function renderEntityLink(type) {
		return (
			<a href={`/${camelCase(type)}/create?${seedingParameters}`}>
				<Button
					className="padding-bottom-1 padding-sides-2 padding-top-1"
					variant="secondary"
				>
					{genEntityIconHTMLElement(type, '3x', false)}
					<div className="margin-top-d4">{translate(`common:entityType.${camelCase(type)}`)}</div>
				</Button>
			</a>
		);
	}
	const entityTypes = ['Author', 'Work', 'Edition', 'Series', 'Publisher'];
	return (
		<div className="text-center">
			<p>
				{translate('callToAction.helpText')}
				<br/>
				<small>
					{translate('callToAction.notSure')}
					<a href="/help">{translate('callToAction.helpPage')}</a>
					{translate('callToAction.toGetStarted')}
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

CallToAction.displayName = 'CallToAction';
CallToAction.propTypes = {
	query: PropTypes.string
};
CallToAction.defaultProps = {
	query: null
};


export default CallToAction;
