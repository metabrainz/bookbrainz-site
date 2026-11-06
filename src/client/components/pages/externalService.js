/*
 * Copyright (C) 2022       Ansh Goyal
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
import PropTypes from 'prop-types';
import React from 'react';
import request from 'superagent';
import {withTranslation} from 'react-i18next';


const {Alert} = bootstrap;
class ExternalServices extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			alertDetails: props.alertDetails,
			alertType: props.alertType,
			cbPermission: props.cbPermission
		};
		this.handleClick = this.handleClick.bind(this);
	}


	handleClick = async (event) => {
		if (event.target.value === 'review') {
			try {
				const data = await request.post('/external-service/critiquebrainz/connect');
				if (data.statusCode === 200) {
					window.location.href = data.text;
				}
				else {
					this.setState({
						alertDetails: this.props.t('common.somethingWentWrong'),
						alertType: 'danger'
					});
				}
			}
			catch (err) {
				this.setState({
					alertDetails: this.props.t('common.somethingWentWrong'),
					alertType: 'danger'
				});
			}
		}
		else {
			try {
				const data = await request.post(
					'/external-service/critiquebrainz/disconnect'
				);
				this.setState({
					alertDetails: data.body.alertDetails,
					alertType: data.body.alertType
				});
				if (data.statusCode === 200) {
					this.setState({
						cbPermission: 'disable'
					});
				}
			}
			catch (err) {
				this.setState({
					alertDetails: this.props.t('common.somethingWentWrong'),
					alertType: 'danger'
				});
			}
		}
	};


	render() {
		const {t: translate} = this.props;
		const ShowServiceOption = (optionData) => {
			const {
				service, value, title, details
			} = optionData;
			return (
				<div
					className={`external-service-option ${value === 'disable' ? 'disable' : ''}`}
				>
					<input
						checked={this.state.cbPermission === value}
						id={`${service}-${value}`}
						type="radio"
						value={value}
						onChange={this.handleClick}
					/>
					<label htmlFor={`${service}-${value}`}>
						<div className="title">
							{title}
						</div>
						<div className="details">
							{details}
						</div>
					</label>
				</div>
			);
		};

		const showAlert = (alertType) => {
			if (alertType === 'success') {
				return (
					<Alert variant="success">
						<strong>{translate('common.successLabel')} {this.state.alertDetails}</strong>
					</Alert>
				);
			}
			else if (alertType === 'danger') {
				return (
					<Alert variant="danger">
						<strong>{translate('common.errorLabel')} {this.state.alertDetails}</strong>
					</Alert>
				);
			}
			return null;
		};

		return (
			<div>
				{showAlert(this.state.alertType)}
				<div className="page-header">
					<h1>{translate('pages.externalServices.heading')}</h1>
				</div>
				<div className="card">
					<div className="card-header">
						<h3 className="card-title">{translate('pages.entity.critiqueBrainz')}</h3>
					</div>
					<div className="card-body">
						<p>
							{translate('pages.externalServices.critiqueBrainzDescription')}
						</p>
						<br/>
						<ShowServiceOption
							details={translate('pages.externalServices.reviewsEnabledDetail')}
							service="critiquebrainz"
							title={translate('pages.entity.reviews')}
							value="review"
						/>
						<ShowServiceOption
							details={translate('pages.externalServices.reviewsDisabledDetail')}
							service="critiquebrainz"
							title={translate('pages.externalServices.disableTitle')}
							value="disable"
						/>
					</div>
				</div>
			</div>
		);
	}
}

ExternalServices.displayName = 'ExternalServices';
ExternalServices.propTypes = {
	alertDetails: PropTypes.string,
	alertType: PropTypes.string,
	cbPermission: PropTypes.string.isRequired,
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired
};
ExternalServices.defaultProps = {
	alertDetails: '',
	alertType: false
};


export default withTranslation()(ExternalServices);
