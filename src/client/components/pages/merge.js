/*
 * Copyright (C) 2015-2016  Stanisław Szcześniak
 *               2015-2016  Ben Ockmore
 *               2016       Sean Burke
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

import CustomInput from '../../input';
import EntityLink from '../entity-link';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import request from 'superagent-bluebird-promise';


const {Button, Col, ListGroup, ListGroupItem, Row} = bootstrap;
const {formatDate} = utilsHelper;

class MergePage extends React.Component {
	static formatValueList(list) {
		if (!list) {
			return null;
		}
		return list.map(
			(val, idx) => <div key={`${idx}${val}`}>{val.toString()}</div>
		);
	}

	static formatChange(change) {
		if (change.kind === 'N') {
			return (
				<tr className="success" key={change.key}>
					<th scope="row">{change.key}</th>
					<td> — </td>
					<td>
						{MergePage.formatValueList(change.rhs)}
					</td>
				</tr>
			);
		}

		if (change.kind === 'E') {
			return (
				<tr className="warning" key={change.key}>
					<th scope="row">{change.key}</th>
					<td>
						{MergePage.formatValueList(change.lhs)}
					</td>
					<td>
						{MergePage.formatValueList(change.rhs)}
					</td>
				</tr>
			);
		}

		if (change.kind === 'D') {
			return (
				<tr className="danger" key={change.key}>
					<th scope="row">{change.key}</th>
					<td>
						{MergePage.formatValueList(change.lhs)}
					</td>
					<td> — </td>
				</tr>
			);
		}

		return null;
	}

	static formatDiff(diff) {
		const result = diff.changes.map(
			(change) =>
				MergePage.formatChange(change)
		);

		return _.compact(result);
	}

	static formatTitle(author) {
		let title;
		if (_.get(author, ['titleUnlock', 'title'], null)) {
			const authorTitle = author.titleUnlock.title;
			title = `${authorTitle.title}: ${authorTitle.description}`;
		}
		else {
			title = 'No Title Set: This user hasn\'t selected a title';
		}
		return title;
	}

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
		const data = {
			note: this.noteInput.getValue()
		};
		request.post(`/revision/${this.props.diffs[0].id}/note`)
			.send(data).promise()
			.then(() => {
				location.reload();
			})
			.catch((res) => {
				// TODO: Add proper error handling.
				const {error} = res.body;
				return error;
			});
	}

	render() {
		const {diffs, user} = this.props;

		const entityTitles = diffs.map((diff) => (
			<h3 key={diff.entity.bbid}>
				<EntityLink
					bbid={diff.entity.bbid}
					text={`${diff.entity.type} ${diff.entity.bbid}`}
					type={diff.entity.type}
				/>
			</h3>
		));
		const diffDivsFlatMap = (
			<div>
				<table className="table table-bordered text-center">
					<tbody>
						{_.uniqWith(diffs.map(diff => MergePage.formatDiff(diff)), _.isEqual)}
					</tbody>
				</table>
			</div>
		);

		return (
			<Row>
				<Col md={12}>

					{entityTitles}
					{diffDivsFlatMap}
					{user &&
						<form
							className="margin-top-2"
							onSubmit={this.handleSubmit}
						>
							<CustomInput
								label="Add Note"
								ref={(ref) => this.noteInput = ref}
								rows="6"
								type="textarea"
							/>
							<Button
								bsStyle="primary"
								className="pull-right margin-top-1"
								title="Submit revision note"
								type="submit"
							>
								Submit
							</Button>
						</form>
					}
				</Col>
			</Row>
		);
	}
}

MergePage.displayName = 'MergePage';
MergePage.propTypes = {
	diffs: PropTypes.any.isRequired,
	user: PropTypes.object
};
MergePage.defaultProps = {
	user: null
};

export default MergePage;
