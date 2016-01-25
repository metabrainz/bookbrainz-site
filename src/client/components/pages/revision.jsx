/*
 * Copyright (C) 2015  Stanisław Szcześniak
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
const React = require('react');

module.exports = React.createClass({
	displayName: 'RevisionPage',
	get_list_of_values(newValue) {
		'use strict';
		const newValues = newValue.map((val, idx) => (
			<div key={idx}>{val.toString()}</div>
		));
		return newValues;
	},
	get_table_row(fieldName, newValue, oldValue) {
		'use strict';
		if ((oldValue && (oldValue.length > 0)) && !(newValue && (newValue.length > 0))) {
			return (
				<tr className="danger" key={fieldName}>
					<th scope="row">{fieldName}</th>
					<td>
						{this.get_list_of_values(oldValue)}
					</td>
					<td> — </td>
				</tr>
			);
		}
		else if (!(oldValue && (oldValue.length > 0)) && (newValue && (newValue.length > 0))) {
			return (
				<tr className="success" key={fieldName}>
					<th scope="row">{fieldName}</th>
					<td> — </td>
					<td>
						{this.get_list_of_values(newValue)}
					</td>
				</tr>
			);
		}
		return (
			<tr className="warning">
				<th key={fieldName} scope="row"> {fieldName} </th>
				<td>
					{this.get_list_of_values(oldValue)}
					<br> </br>
				</td>
				<td>
					{this.get_list_of_values(newValue)}
					</td>
			</tr>
		);
	},
	get_table_rows(diff) {
		'use strict';
		var result = [];
		diff.forEach((difference) => {
			for (const key in difference) {
				if (difference.hasOwnProperty(key)) {
					const oldValue = difference[key][1];
					const newValue = difference[key][0];
					result.push(
						this.get_table_row(key, newValue, oldValue)
					);
				}
			}
		});
		return result;
	},
	render() {
		'use strict';
		const revision = this.props.revision;
		const diff = this.props.diff;

		var link_to_entity = '';
		if (revision.entity) {
			link_to_entity = (
				`/${revision.entity._type.toLowerCase()}/${revision.entity.bbid}`
			);
		}
		const data_description = revision.entity ? (
			<a href={link_to_entity}>
				{revision.entity._type} {revision.entity.bbid}
			</a>
		) : (`Relationship ${revision.relationship.id}`);

		const diff_table = diff ? (
			<table className="table table-bordered text-center">
				<tbody>
					{this.get_table_rows(diff)}
				</tbody>
			</table>
		) : (
			<div className="alert alert-danger">
				 Error calculating diff. Please note that diffs for DELETE revisions are currently unsupported.
			</div>
			);

		const editor_link = `/editor/${revision.user.id}`;

		const time_created =
			new Date(revision.created_at).toTimeString();
		const date_created =
			new Date(revision.created_at).toDateString();

		const date_and_time_created = `${time_created}, ${date_created}`;

		const revision_notes = revision.note ? (
			<div className="panel panel-default">
				<div className="panel-body">
					<p>{revision.note}</p>
					<p className="text-right">
						—&nbsp;
						<a href={editor_link}>
							{revision.user.name}
						</a>
						, {date_and_time_created}
					</p>
				</div>
			</div>
		) : (<p> No revision notes present </p>);

		return (
			<div>
				<h1>Revision #{revision.id}</h1>
				<h3>{data_description}</h3>
				{diff_table}
				<p className="text-right">
					Created by&nbsp;
					<a href={editor_link}>
						{revision.user.name}
					</a>
					, {date_created}
				</p>

				<h3>Revision Notes</h3>
				{revision_notes}

			</div>
		);
	}
});
