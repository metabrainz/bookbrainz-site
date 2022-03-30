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
import React, {ChangeEvent, Component} from 'react';
import LoadingSpinner from '../loading-spinner';
import ReactSelect from 'react-select';
import SelectWrapper from '../input/select-wrapper';
import request from 'superagent';


type RegistrationFormProps = {
	gender?:{id:string};
	genders: [];
	name:string;
};
type RegistrationFormState = {
	displayName:string;
	error: string | null;
	gender?:string;
	waiting:boolean;
};

const {Alert, Button, Col, Form, Row} = bootstrap;

class RegistrationForm extends Component<RegistrationFormProps, RegistrationFormState> {
	constructor(props) {
		super(props);

		this.state = {
			displayName: props.name ?? '',
			error: null,
			gender: props.gender?.id,
			waiting: false
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
	}

	async handleSubmit(event) {
		const {displayName, gender} = this.state;

		event.preventDefault();

		if (!displayName) {
			this.setState({
				error: 'Please fill in a display name',
				waiting: false
			});
			return;
		}

		const data = {
			displayName,
			gender: gender ? parseInt(gender, 10) : null
		};

		this.setState({
			error: null,
			waiting: true
		});

		try {
			await request.post('/register/handler')
				.send(data);
		}
		catch (err) {
			this.setState({
				error: err.message,
				waiting: false
			});
		}
	}

	handleNameChange(event: ChangeEvent<HTMLInputElement>) {
		this.setState({
			displayName: event.target.value
		});
	}

	handleGenderChange(value) {
		this.setState({
			gender: value
		});
	}

	render() {
		const {displayName, gender, error, waiting} = this.state;

		let errorComponent = null;
		if (error) {
			errorComponent =
				<Alert variant="danger">{error}</Alert>;
		}

		const loadingComponent = waiting ? <LoadingSpinner/> : null;

		return (
			<div>
				<div className="page-header"><h1>Register</h1></div>
				<div>
					Great! You successfully logged in to MusicBrainz and
					are now just one step away from becoming a BookBrainz
					editor. The following form allows you to specify
					additional information that will let other users know
					a little bit more about you. When you’re done, just
					click the blue button at the bottom of the page.
				</div>
				<Row>
					{loadingComponent}
					<Col lg={{offset: 3, span: 6}}>
						<form
							className="whole-page-form form-horizontal"
							onSubmit={this.handleSubmit}
						>
							<p>
								Firstly, please check that your display
								name is correct. This is the name that
								other editors will get to know you by.
							</p>
							<Form.Group className="row">
								<Form.Label className="col-lg-4 col-form-label">
									Display Name
								</Form.Label>
								<div className="col-lg-4">
									<Form.Control
										defaultValue={this.props.name}
										placeholder="Display Name"
										type="text"
										onChange={this.handleNameChange}
									/>
								</div>
							</Form.Group>
							<p>
								And, optionally, set a gender
								that will be displayed on your profile
								page.
							</p>
							<SelectWrapper
								base={ReactSelect}
								defaultValue={gender}
								groupClassName="row"
								idAttribute="id"
								instanceId="gender"
								label="Gender"
								labelAttribute="name"
								labelClassName="col-lg-4 col-form-label"
								options={this.props.genders}
								placeholder="Select gender…"
								wrapperClassName="col-lg-4"
								onChange={this.handleGenderChange}
							/>
							<hr/>
							{errorComponent}
							<div className="text-center">
								<Button
									disabled={displayName?.length <= 0}
									size="lg"
									type="submit"
									variant="primary"
								>
									Looks good, sign me up!
								</Button>
							</div>
						</form>
					</Col>
				</Row>
			</div>
		);
	}
}


export default RegistrationForm;
