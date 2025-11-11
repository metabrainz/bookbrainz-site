/*
 * Copyright (C) 2020 Prabal Singh
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
import * as utilsHelper from '../../../helpers/utils';
import {genEntityIconHTMLElement, getEntityLabel, getEntityUrl} from '../../../helpers/entity';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {faCodeBranch} from '@fortawesome/free-solid-svg-icons';


const {Table} = bootstrap;
const {formatDate, stringToHTMLWithLinks} = utilsHelper;

function RevisionsTable(props) {
	const {results, showEntities, showRevisionNote, showRevisionEditor, tableHeading} = props;
	return (
		<div>
			<div>
				<h1 className="text-center">{tableHeading}</h1>
			</div>
			<hr className="thin"/>
			{
				results.length > 0 ?
					<Table
						borderless
						responsive
						striped
					>
						<thead>
							<tr>
								<th width="16%">Revision ID</th>
								{
									showEntities ?
										<th width="42%">Modified entities</th> : null
								}
								{
									showRevisionEditor ?
										<th width="25%">User</th> : null
								}
								{
									showRevisionNote ?
										<th width="16%">Note</th> : null
								}
								<th width="16%">Date</th>
							</tr>
						</thead>

						<tbody>
							{
								results.map((revision) => (
									<tr key={revision.revisionId}>
										<td>
											<a
												href={`/revision/${revision.revisionId}`}
												title={`${revision.isMerge ? 'Merge revision' : 'Revision'} ${revision.revisionId}`}
											>
												#{revision.revisionId}
												{revision.isMerge &&
													<span
														className="round-color-icon"
														style={{marginLeft: '0.5em'}}
													>
														<FontAwesomeIcon
															flip="vertical" icon={faCodeBranch}
															transform="shrink-4"
														/>
													</span>
												}
											</a>
										</td>
										{
											showEntities ?
												<td>
													{revision.entities.map(entity => (
														<div key={`${revision.revisionId}-${entity.bbid}`}>
															<a href={getEntityUrl(entity)} >
																{genEntityIconHTMLElement(entity.type)}
																{getEntityLabel(entity)}
															</a>
														</div>
													))}
												</td> : null
										}
										{
											showRevisionEditor ?
												<td>
													<a href={`/editor/${revision.editor.id}`} >
														{revision.editor.name}
													</a>
												</td> : null
										}
										{
											showRevisionNote ?
												<td>
													{
														revision.notes.map(note => (
															<div className="revision-note clearfix" key={note.id}>
																<span className="note-content">
																	{stringToHTMLWithLinks(note.content)}
																	<a
																		className="note-author float-end"
																		href={`/editor/${note.author.id}`}
																	>
																		—{note.author.name}
																	</a>
																</span>
															</div>
														))
													}
												</td> : null
										}
										<td>{formatDate(new Date(revision.createdAt), true)}</td>
									</tr>
								))
							}
						</tbody>
					</Table> :

					<div>
						<h4> No revisions to show</h4>
						<hr className="wide"/>
					</div>
			}
		</div>

	);
}

RevisionsTable.propTypes = {
	results: PropTypes.array.isRequired,
	showEntities: PropTypes.bool,
	showRevisionEditor: PropTypes.bool,
	showRevisionNote: PropTypes.bool,
	tableHeading: PropTypes.node
};
RevisionsTable.defaultProps = {
	showEntities: false,
	showRevisionEditor: false,
	showRevisionNote: false,
	tableHeading: 'Recent Activity'

};

RevisionsTable.displayName = 'RevisionsTable';

export default RevisionsTable;
