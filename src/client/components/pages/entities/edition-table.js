/*
 * Copyright (C) 2017  Ben Ockmore
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
import * as entityHelper from '../../../helpers/entity';
import * as utilHelper from '../../../helpers/utils';

import {faBook, faPlus} from '@fortawesome/free-solid-svg-icons';

import AuthorCreditDisplay from '../../author-credit-display';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {kebabCase as _kebabCase} from 'lodash';


const {
	getEditionReleaseDate, getEntityLabel, getEntityDisambiguation,
	getISBNOfEdition, getEditionFormat, getAuthorCreditNames
} = entityHelper;
const {Button, Table} = bootstrap;

function EditionTableRow({edition, showAddedAtColumn, showAuthorCreditsColumn, showCheckboxes, selectedEntities, onToggleRow}) {
	const name = getEntityLabel(edition);
	const disambiguation = getEntityDisambiguation(edition);
	const number = edition.number || '?';
	const releaseDate = getEditionReleaseDate(edition);
	const isbn = getISBNOfEdition(edition);
	const editionFormat = getEditionFormat(edition);
	const authorCreditNames = showAuthorCreditsColumn ? getAuthorCreditNames(edition) : [];
	const addedAt = showAddedAtColumn ? utilHelper.formatDate(new Date(edition.addedAt), true) : null;

	/* eslint-disable react/jsx-no-bind */
	return (
		<tr>
			{edition.displayNumber && <td>{number}</td>}
			<td>
				{
					showCheckboxes ?
						<input
							checked={selectedEntities.find(bbid => bbid === edition.bbid)}
							className="checkboxes"
							id={edition.bbid}
							type="checkbox"
							onClick={() => onToggleRow(edition.bbid)}
						/> : null
				}
				<a href={`/edition/${edition.bbid}`}>{name}</a>
				{disambiguation}
			</td>
			{showAuthorCreditsColumn && <td>{authorCreditNames.length ? <AuthorCreditDisplay names={authorCreditNames}/> : '?'}</td>}
			<td>{editionFormat}</td>
			<td>
				{
					isbn ?
						<a
							href={`https://isbnsearch.org/isbn/${isbn.value}`}
							rel="noopener noreferrer"
							target="_blank"
						>
							{isbn.value}
						</a> : '?'
				}
			</td>
			<td>
				{releaseDate}
			</td>
			{showAddedAtColumn ? <td>{addedAt}</td> : null}
		</tr>
	);
}
EditionTableRow.displayName = 'EditionTableRow';
EditionTableRow.propTypes = {
	edition: PropTypes.object.isRequired,
	onToggleRow: PropTypes.func,
	selectedEntities: PropTypes.array,
	showAddedAtColumn: PropTypes.bool.isRequired,
	showAuthorCreditsColumn: PropTypes.bool,
	showCheckboxes: PropTypes.bool
};
EditionTableRow.defaultProps = {
	onToggleRow: null,
	selectedEntities: [],
	showAuthorCreditsColumn: false,
	showCheckboxes: false
};

function EditionTable({editions, entity, showAddedAtColumn, showAdd, showAuthorCreditsColumn, showCheckboxes, selectedEntities, onToggleRow}) {
	let tableContent;
	if (editions.length) {
		tableContent = (
			<React.Fragment>
				<Table striped>
					<thead>
						<tr>
							{editions[0].displayNumber && <th style={{width: '10%'}}>#</th>}
							<th>Name</th>
							{showAuthorCreditsColumn && <th>Author Credits</th>}
							<th>Format</th>
							<th>ISBN</th>
							<th>Release Date</th>
							{
								showAddedAtColumn ? <th>Added at</th> : null
							}
						</tr>
					</thead>
					<tbody>
						{
							editions.map((edition) => (
								<EditionTableRow
									edition={edition}
									key={edition.bbid}
									selectedEntities={selectedEntities}
									showAddedAtColumn={showAddedAtColumn}
									showAuthorCreditsColumn={showAuthorCreditsColumn}
									showCheckboxes={showCheckboxes}
									onToggleRow={onToggleRow}
								/>
							))
						}
					</tbody>
				</Table>
				{showAdd &&
					<Button
						className="margin-top-d15"
						href={`/edition/create?${_kebabCase(entity.type)}=${entity.bbid}`}
						variant="success"
					>
						<FontAwesomeIcon icon={faPlus}/>
						{'  Add Edition'}
					</Button>
				}
			</React.Fragment>
		);
	}
	else if (showAdd) {
		tableContent = (
			<React.Fragment>
				<span className="margin-right-2 float-start">
					<Button
						href={`/edition/create?${_kebabCase(entity.type)}=${entity.bbid}`}
						variant="success"
					>
						<FontAwesomeIcon icon={faBook} size="2x"/>
						<br/>
						Add Edition
					</Button>
				</span>
				<span>
					<h4>There are no Editions yet!</h4>
					<p>
						Help us complete BookBrainz
						<br/>
					</p>
					<br/><small>Not sure what to do? Visit the <a href="/help">help page</a> to get started.</small>
				</span>
				<hr className="margin-bottom-d0"/>
			</React.Fragment>
		);
	}
	else {
		tableContent = <span>No editions</span>;
	}
	return (
		<div>
			<h2>Editions</h2>
			{tableContent}
		</div>
	);
}
EditionTable.displayName = 'EditionTable';
EditionTable.propTypes = {
	editions: PropTypes.array.isRequired,
	entity: PropTypes.object,
	onToggleRow: PropTypes.func,
	selectedEntities: PropTypes.array,
	showAdd: PropTypes.bool,
	showAddedAtColumn: PropTypes.bool,
	showAuthorCreditsColumn: PropTypes.bool,
	showCheckboxes: PropTypes.bool
};
EditionTable.defaultProps = {
	entity: null,
	onToggleRow: null,
	selectedEntities: [],
	showAdd: true,
	showAddedAtColumn: false,
	showAuthorCreditsColumn: false,
	showCheckboxes: false
};

export default EditionTable;
