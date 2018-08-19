/*
 * Copyright (C) 2018 Shivam Tripathi
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
import {
	getImportDiscardUrl, getImportUrl
} from '../../../helpers/import-entity';
import LoadingSpinner from '../../loading-spinner';
import PropTypes from 'prop-types';
import React from 'react';
import request from 'superagent-bluebird-promise';


const {Alert, Button, ButtonGroup, Col, Panel, Row} = bootstrap;

class DiscardImportEntity extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			waiting: false
		};

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		event.preventDefault();

		this.setState({
			error: null,
			waiting: true
		});

		const discardUrl = getImportDiscardUrl(this.props.importEntity);
		const importUrl = getImportUrl(this.props.importEntity);

		request.post(discardUrl)
			.then(() => {
				window.location.href = importUrl;
			})
			.catch((res) => {
				const {error} = res.body;

				this.setState({
					error,
					waiting: false
				});
			});
	}

	render() {
		const {importEntity} = this.props;

		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				<Alert bsStyle="danger">{this.state.error}</Alert>;
		}

		const loadingComponent = this.state.waiting ? <LoadingSpinner/> : null;

		const headerComponent = <h3>Confirm Discard</h3>;

		const entityName =
			importEntity.defaultAlias ?
				importEntity.defaultAlias.name : '(unnamed)';

		return (
			<div>
				<h1> Discard Imported Entity </h1>
				<Row className="margin-top-2">
					{loadingComponent}
					<Col md={6} mdOffset={3}>
						{errorComponent}
						<Panel
							bsStyle="danger"
							header={headerComponent}
						>
							We really appreciate your efforts in helping us
							improve our database. The {importEntity.type}
							<b className="color-red"> {entityName} </b>
							has been automatically added to
							our records and will be permanently deleted in
							case multiple editors find it to be corrupt.
							If you’re sure that the {importEntity.type}
							<b className="color-red"> {entityName} </b>
							should be discarded, please press the confirm
							button below. Other wise click cancel to get back
							to the imported entity page.
						</Panel>
						<ButtonGroup justified className="margin-top-2">
							<Button
								bsStyle="default"
								href={this.importUrl}
								title="Edit"
							>
								Cancel
							</Button>
							<Button
								bsStyle="danger"
								href="#"
								title="Discard"
								onClick={this.handleClick}
							>
								Discard
							</Button>
						</ButtonGroup>
					</Col>
				</Row>
			</div>
		);
	}
}

DiscardImportEntity.displayName = 'DiscardImportEntity';
DiscardImportEntity.propTypes = {
	importEntity: PropTypes.object.isRequired
};

export default DiscardImportEntity;
