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
import {faCodeBranch, faEye, faUndo} from '@fortawesome/free-solid-svg-icons';
import {genEntityIconHTMLElement, getEntityLabel, getEntityUrl} from '../../../helpers/entity';
import ConfirmationModal from './confirmation-modal';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';


const {Table, OverlayTrigger, Tooltip, Badge} = bootstrap;
const {formatDate, stringToHTMLWithLinks} = utilsHelper;

function RevisionsTable(props) {
	const {results, showEntities, showActions, showRevisionNote, showRevisionEditor, tableHeading, masterRevisionId, handleMasterChange} = props;
	const [show, setShow] = React.useState(false);
	const [revisionId, setRevisionId] = React.useState(null);
	const showConfirmModal = React.useCallback((rid) => {
		setRevisionId(rid);
		setShow(true);
	}, []);
	const hideConfirmModal = React.useCallback(() => setShow(false), []);
	const onConfirm = React.useCallback(() => {
		handleMasterChange(revisionId);
		hideConfirmModal();
	}, [revisionId]);
	function makeClickHandler(rid) {
		return () => showConfirmModal(rid);
	}
	return (
		<div>
			<ConfirmationModal
				message={`Are you sure you want to change the master revision from #${masterRevisionId} to #${revisionId} ?`}
				show={show}
				title="Revert Revision"
				onCancel={hideConfirmModal}
				onConfirm={onConfirm}
			/>

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
								<th className="col-md-2">Revision ID</th>
								{
									showEntities ?
										<th className="col-md-5">Modified entities</th> : null
								}
								{
									showRevisionEditor ?
										<th className="col-md-3">User</th> : null
								}
								{
									showRevisionNote ?
										<th className="col-md-3">Note</th> : null
								}
								<th className="col-md-2">Date</th>
								{showActions && <th className="col-md-2">Actions</th>}
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
												{showActions && revision.revisionId === masterRevisionId &&
												<Badge className="ml-2 bg-success text-white">
													Active
												</Badge>}
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
																		className="note-author float-right"
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
										{showActions &&
										<td>
											<div className="d-flex align-items-center">
												<OverlayTrigger
													delay={50}
													overlay={
														<Tooltip>
													View entity at this revision
														</Tooltip>}
													placement="right"
												>
													<a href={`revision/${revision.revisionId}`}>
														<FontAwesomeIcon className="mr-2 text-secondary" icon={faEye}/>
													</a>
												</OverlayTrigger>
												<OverlayTrigger
													delay={50}
													overlay={
														<Tooltip>
														Revert entity to this revision
														</Tooltip>}
													placement="right"
												>
													<FontAwesomeIcon
														className={`ml-2 cursor-pointer
													${revision.revisionId === masterRevisionId || revision.isMerge ? 'text-muted' : 'text-danger'}`}
														icon={faUndo}
														onClick={revision.revisionId === masterRevisionId || revision.isMerge ? null :
															makeClickHandler(revision.revisionId)}
													/>
												</OverlayTrigger>
											</div>
										</td>
										}
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
	handleMasterChange: PropTypes.func,
	masterRevisionId: PropTypes.number,
	results: PropTypes.array.isRequired,
	showActions: PropTypes.bool,
	showEntities: PropTypes.bool,
	showRevisionEditor: PropTypes.bool,
	showRevisionNote: PropTypes.bool,
	tableHeading: PropTypes.node
};
RevisionsTable.defaultProps = {
	handleMasterChange: null,
	masterRevisionId: null,
	showActions: false,
	showEntities: false,
	showRevisionEditor: false,
	showRevisionNote: false,
	tableHeading: 'Recent Activity'

};

RevisionsTable.displayName = 'RevisionsTable';

export default RevisionsTable;
