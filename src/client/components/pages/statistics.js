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

import PropTypes from 'prop-types';
import React from 'react';
import {startCase as _startCase} from 'lodash';
import {genEntityIconHTMLElement} from '../../helpers/entity';


const {PageHeader, Table} = bootstrap;
const {formatDate} = utilsHelper;

/**
 * Renders the document and displays the topEditors table.
 * @returns {ReactElement} a HTML document which displays the topEditors table
 * in the statistics page
 */

function TopEditorsTable(props) {
	const {editors} = props;
	return (
		<div>
			<div>
				<h2>Top 10 Editors</h2>
			</div>
			<Table
				bordered
				condensed
				striped
			>
				<thead>
					<tr>
						<th className="col-sm-1" >#</th>
						<th className="col-sm-5" >Editor&apos;s Name</th>
						<th className="col-sm-3" >Total Revisions</th>
						<th className="col-sm-3" >Registration Date</th>
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

TopEditorsTable.propTypes = {
	editors: PropTypes.array.isRequired
};

/**
 * Renders the document and displays the EntityCountTable table.
 * @returns {ReactElement} a HTML document which displays the
 * EntityCountTable table in the statistics page
 */

function EntityCountTable(props) {
	const {allEntities, last30DaysEntities} = props;
	return (
		<div>
			<div>
				<h2>Total Entities</h2>
			</div>
			<Table
				bordered
				condensed
				striped
			>
				<thead>
					<tr>
						<th className="col-sm-1" >#</th>
						<th className="col-sm-5" >Entity Type</th>
						<th className="col-sm-3" >Total</th>
						<th className="col-sm-3" >Added in Last 30 days</th>
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

EntityCountTable.propTypes = {
	allEntities: PropTypes.array.isRequired,
	last30DaysEntities: PropTypes.object.isRequired
};

/**
 * Renders the document and displays the 'Statistics' page.
 * @returns {ReactElement} a HTML document which displays the statistics
 * page
 */

function StatisticsPage(props) {
	const {allEntities, last30DaysEntities, topEditors} = props;
	return (
		<div>
			<PageHeader>Statistics of BookBrainz</PageHeader>
			<TopEditorsTable editors={topEditors}/>
			<EntityCountTable
				allEntities={allEntities}
				last30DaysEntities={last30DaysEntities}
			/>
		</div>
	);
}

StatisticsPage.displayName = 'StatisticsPage';
StatisticsPage.propTypes = {
	allEntities: PropTypes.array.isRequired,
	last30DaysEntities: PropTypes.object.isRequired,
	topEditors: PropTypes.array.isRequired
};

export default StatisticsPage;
