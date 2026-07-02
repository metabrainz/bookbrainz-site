/*
 * Copyright (C) 2015  Annie Zhou
 *               2016  Sean Burke
 *               2016  Ben Ockmore
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
import * as validators from '../../helpers/react-validators';
import LoadingSpinner from '../loading-spinner';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import request from 'superagent';
import {withTranslation} from 'react-i18next';


const {Alert, Button, Col, Form, Row} = bootstrap;

class RegistrationForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			valid: this.isValid(),
			waiting: false
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();

		const genderId = this.gender?.select?.getValue()?.[0]?.id;
		const data = {
			displayName: this.displayName.value,
			gender: genderId ? parseInt(genderId, 10) : null
		};

		this.setState({
			error: null,
			waiting: true
		});

		request.post('/register/handler')
			.send(data)
			.then(() => {
				window.location.href = '/auth';
			})
			.catch((res) => {
				const {error} = res.body;
				this.setState({
					error,
					waiting: false
				});
			});
	}

	isValid() {
		return !this.displayName || this.displayName.value.length > 0;
	}

	handleChange() {
		this.setState({
			valid: this.isValid()
		});
	}

	getOptionLabel(option) {
		return option.name;
	}

	render() {
		// eslint-disable-next-line id-length
		const {t: translate} = this.props;
		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				<Alert variant="danger">{this.state.error}</Alert>;
		}
		const loadingComponent = this.state.waiting ? <LoadingSpinner/> : null;
		const initialGender = this.props.gender && this.props.gender.id;
		return (
			<div>
				<div className="page-header"><h1>{translate('pages:registration.heading')}</h1></div>
				<div>
					{translate('pages:registration.introText')}
				</div>
				<Row>
					{loadingComponent}
					<Col lg={{offset: 3, span: 6}}>
						<form
							className="whole-page-form form-horizontal"
							onSubmit={this.handleSubmit}
						>
							<p>
								{translate('pages:registration.displayNameIntro')}
							</p>
							<Form.Group className="row">
								<Form.Label className="col-lg-4 col-form-label">
									{translate('pages:registration.displayNameLabel')}
								</Form.Label>
								<div className="col-lg-4">
									<Form.Control
										defaultValue={this.props.name}
										placeholder={translate('pages:registration.displayNamePlaceholder')}
										/* eslint-disable-next-line react/jsx-no-bind */
										ref={(ref) => this.displayName = ref}
										type="text"
										onChange={this.handleChange}
									/>
								</div>
							</Form.Group>
							<p>
								{translate('pages:registration.genderIntro')}
							</p>
							<Form.Group className="row">
								<Form.Label className="col-lg-4 col-form-label">{translate('common:gender')}</Form.Label>
								<div className="col-lg-4">
									<ReactSelect
										isClearable
										defaultValue={this.props.genders.filter((option) => option.id === initialGender)}
										getOptionLabel={this.getOptionLabel}
										instanceId="gender"
										options={this.props.genders}
										placeholder={translate('pages:registration.genderPlaceholder')}
										ref={(ref) => this.gender = ref}
									/>
								</div>
							</Form.Group>
							<hr/>
							{errorComponent}
							<div className="text-center">
								<Button
									disabled={!this.state.valid}
									size="lg"
									type="submit"
									variant="primary"
								>
									{translate('pages:registration.submitButton')}
								</Button>
							</div>
						</form>
					</Col>
				</Row>
			</div>
		);
	}
}

RegistrationForm.displayName = 'RegistrationForm';
RegistrationForm.propTypes = {
	gender: validators.namedProperty,
	genders: PropTypes.arrayOf(validators.namedProperty).isRequired,
	name: PropTypes.string,
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired
};
RegistrationForm.defaultProps = {
	gender: null,
	name: null
};

export default withTranslation(['pages', 'common'])(RegistrationForm);
