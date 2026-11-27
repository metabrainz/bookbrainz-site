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

import React, {useCallback, useState} from 'react';
import {differenceBy as _differenceBy, camelCase, kebabCase} from 'lodash';
import AddToCollectionModal from './add-to-collection-modal';
import {ENTITY_TYPES} from 'bookbrainz-data/lib/types/entity';
import type {SearchResult} from '../../../../common/types/search';
import type {SiteUser} from '../../../../common/types/site';
import {genEntityIconHTMLElement} from '../../../helpers/entity-icon';
import {useTranslation} from 'react-i18next';


const {Alert, Button, ButtonGroup, Table} = bootstrap;


type Message = {
	text: string,
	type: 'danger' | 'success'
};

type Props = {
	condensed?: boolean,
	results?: Array<SearchResult | null>,
	user?: SiteUser | null
};

function getId(result: SearchResult) {
	return 'bbid' in result ? result.bbid : result.id;
}

export default function SearchResults({condensed = false, results = [], user = null}: Props) {
	const {t: translate} = useTranslation();
	const [message, setMessage] = useState<Message | null>(null);
	const [selected, setSelected] = useState<SearchResult[]>([]);
	const [showModal, setShowModal] = useState(false);

	const closeModal = useCallback(() => {
		setShowModal(false);
	}, []);

	const closeModalAndShowMessage = useCallback((newMessage: Message | null) => {
		setMessage(newMessage);
		setShowModal(false);
	}, []);

	const toggleRow = useCallback((entity: SearchResult) => {
		setSelected((oldSelected) => {
			if (oldSelected.some(item => getId(item) === getId(entity))) {
				return oldSelected.filter(item => getId(item) !== getId(entity));
			}
			return [...oldSelected, entity];
		});
	}, []);

	const handleClearSelected = useCallback(() => {
		setSelected([]);
	}, []);

	const handleAddToCollection = useCallback(() => {
		if (!selected.length) {
			setMessage({text: translate('pages.searchResults.nothingSelected'), type: 'danger'});
			return;
		}
		const {type} = selected[0];
		if (!selected.every(entity => entity.type === type)) {
			setMessage({text: translate('pages.searchResults.sameTypeRequired'), type: 'danger'});
		}
		else if (ENTITY_TYPES.some((entityType) => entityType === type)) {
			setMessage(null);
			setShowModal(true);
		}
		else {
			setMessage({text: translate('pages.searchResults.cannotAdd', {type}), type: 'danger'});
		}
	}, [selected, translate]);

	if (results.length === 0) {
		return null;
	}

	const rows = results.map((result) => {
		if (!result) {
			return null;
		}
		const id = getId(result);
		const name = result.defaultAlias ? result.defaultAlias.name :
			translate('common.unnamed');

		const aliases = !condensed && result.aliasSet?.aliases;

		const secondaryAliases = !condensed && aliases &&
			_differenceBy(aliases, [result.defaultAlias], 'id').map(alias => alias.name).join(', ');

		const disambiguation = result.disambiguation ? <small>({result.disambiguation.comment})</small> : '';
		// No redirect link for Area entity results
		const link = result.type === 'Area' ?
			`//musicbrainz.org/area/${id}` :
			`/${kebabCase(result.type)}/${id}`;

		return (
			<tr key={id}>
				{
					!condensed &&
					<td>
						{
							user ?
								<input
									aria-label={name}
									checked={selected.some(item => getId(item) === id)}
									className="checkboxes"
									type="checkbox"
									// eslint-disable-next-line react/jsx-no-bind
									onChange={() => toggleRow(result)}
								/> : null
						}
						{genEntityIconHTMLElement(result.type)}{translate(`common.entityType.${camelCase(result.type)}`)}
					</td>
				}
				<td>
					<a href={link}>
						{name} {disambiguation}
					</a>
					{
						result.type === 'Work' && Boolean(result.authors?.length) &&
						<span className="small text-muted"> — <i>{result.authors?.join(', ')}</i></span>
					}
				</td>
				{
					!condensed &&
					<td>
						{secondaryAliases}
					</td>
				}
			</tr>
		);
	});

	return (
		<div>
			{
				user ?
					<AddToCollectionModal
						bbids={selected.map(getId)}
						closeModalAndShowMessage={closeModalAndShowMessage}
						entityType={selected[0]?.type}
						handleCloseModal={closeModal}
						show={showModal}
						userId={user.id}
					/> : null
			}
			{
				!condensed &&
				<h3 className="search-results-heading">
					{translate('common.searchResults')}
				</h3>
			}
			<hr className="thin"/>
			<Table
				responsive
				className={`table table-striped${condensed ? ' table-condensed' : ''}`}
			>
				{
					!condensed &&
					<thead>
						<tr>
							<th style={{width: '25%'}}>{translate('common.type')}</th>
							<th style={{width: '42%'}}>{translate('common.name')}</th>
							<th style={{width: '33%'}}>{translate('common.aliases')}</th>
						</tr>
					</thead>
				}
				<tbody>
					{rows}
				</tbody>
			</Table>
			{
				message?.text ?
					<Alert
						className="margin-top-1"
						variant={message.type}
					>
						{message.text}
					</Alert> : null

			}
			{
				user ?
					<ButtonGroup>
						<Button
							disabled={!selected.length}
							type="button"
							variant="primary"
							onClick={handleAddToCollection}
						>
							{genEntityIconHTMLElement('Collection')}
							{translate('pages.searchResults.addToCollection')}
						</Button>
						<Button
							disabled={!selected.length}
							type="button"
							variant="warning"
							onClick={handleClearSelected}
						>
							{translate('pages.searchResults.clearSelected', {count: selected.length})}
						</Button>
					</ButtonGroup> : null
			}
		</div>
	);
}
