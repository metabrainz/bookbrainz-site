/*
 * Copyright (C) 2018 Akhilesh Kumar <akhilesh5991@gmail.com>
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
import * as utilsHelper from '../../helpers/utils';

import React from 'react';
import {type _Editor} from '../../../types';
import {startCase as _startCase} from 'lodash';
import {genEntityIconHTMLElement} from '../../helpers/entity';


const {Table} = bootstrap;
const {formatDate} = utilsHelper;

/**
 * Renders the document and displays the topEditors table.
 * @param {TopEditorsTableProps} props - The properties passed to the TopEditorsTableProps component.
 * @returns {ReactElement} a HTML document which displays the topEditors table
 * in the statistics page
 */

interface TopEditorsTableProps {
	editors: Array<_Editor>,
}

function TopEditorsTable({editors}: TopEditorsTableProps) {
	return (
		<div>
			<div>
				<h2>Top 10 Editors</h2>
			</div>
			<Table
				bordered
				striped
				size="sm"
			>
				<thead>
					<tr>
						<th width="8%" >#</th>
						<th width="42%" >Editor&apos;s Name</th>
						<th width="25%" >Total Revisions</th>
						<th width="25%" >Registration Date</th>
					</tr>
				</thead>
				<tbody>
					{
						editors.map((editor, i) => (
							<tr key={editor.id}>
								<td>{i + 1}</td>
								<td>
									<a	href={`/editor/${editor.id}`}>
										{editor.name}
									</a>
								</td>
								<td>{editor.totalRevisions}</td>
								<td>
									{formatDate(new Date(editor.createdAt))}
								</td>
							</tr>
						))
					}
				</tbody>
			</Table>
		</div>
	);
}

TopEditorsTable.displayName = 'TopEditorsTable';

/**
 * Renders the document and displays the EntityCountTable table.
 * @param {EntityCountTableProps} props - The properties passed to the EntityCountTable component.
 * @returns {JSX.Element} a HTML document which displays the
 * EntityCountTable table in the statistics page
 */

interface EntityCountTableProps {
	allEntities: Array<{
		Count: string,
		modelName: string,
		}>,
	last30DaysEntities: { [key: string]: string },
}

function EntityCountTable({allEntities, last30DaysEntities}: EntityCountTableProps): JSX.Element {
	return (
		<div>
			<div>
				<h2>Total Entities</h2>
			</div>
			<Table
				bordered
				striped
				size="sm"
			>
				<thead>
					<tr>
						<th width="8%" >#</th>
						<th width="42%" >Entity Type</th>
						<th width="25%" >Total</th>
						<th width="25%" >Added in Last 30 days</th>
					</tr>
				</thead>
				<tbody>
					{
						allEntities.map((entity, i) => (
							<tr key={entity.modelName}>
								<td>{i + 1}</td>
								<td>
									{genEntityIconHTMLElement(entity.modelName)}
									{_startCase(entity.modelName)}
								</td>
								<td>{entity.Count}</td>
								<td>{last30DaysEntities[entity.modelName]}</td>
							</tr>
						))
					}
				</tbody>
			</Table>
		</div>
	);
}

/**
 * Renders the document and displays the 'Statistics' page.
 * @param {StatisticsPageProps} props - The properties passed to the StatisticsPage component.
 * @returns {JSX.Element} A HTML document which displays the statistics page.
 */

interface StatisticsPageProps{
	allEntities: Array<{
		Count: string,
		modelName: string,
		}>,
	last30DaysEntities: { [key: string]: string },
	topEditors: Array<_Editor>,
}

function StatisticsPage({allEntities, last30DaysEntities, topEditors}: StatisticsPageProps): JSX.Element {
	return (
		<div>
			<div className="page-header"><h1>Statistics of BookBrainz</h1></div>
			<TopEditorsTable editors={topEditors}/>
			<EntityCountTable
				allEntities={allEntities}
				last30DaysEntities={last30DaysEntities}
			/>
		</div>
	);
}

StatisticsPage.displayName = 'StatisticsPage';
export default StatisticsPage;
