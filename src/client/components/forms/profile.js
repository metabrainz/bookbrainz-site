/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
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
const request = require('superagent-bluebird-promise');

const Button = require('react-bootstrap').Button;
const Input = require('react-bootstrap').Input;

const LoadingSpinner = require('../loading-spinner');
const Select = require('../input/select2');
const SearchSelect = require('../input/entity-search');

const validators = require('../../helpers/react-validators');
const injectDefaultAliasName =
	require('../../helpers/utils').injectDefaultAliasName;

class ProfileForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			bio: this.props.editor.bio,
			title: toString(this.props.editor.titleUnlockId),
			area: this.props.editor.area ?
				this.props.editor.area : null,
			waiting: false
		};

		// React does not autobind non-React class methods
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(evt) {
		evt.preventDefault();
		const area = this.area.getValue();

		const data = {
			areaId: area ? parseInt(area.id, 10) : null,
			id: this.props.editor.id,
			bio: this.bio.getValue().trim()
		};
		const title = this.title.getValue();
		if (title !== '') {
			data.title = title;
		}

		request.post('/editor/edit/handler')
			.send(data).promise()
			.then(() => {
				window.location.href = `/editor/${this.props.editor.id}`;
			});
	}

	render() {
		const loadingElement =
			this.state.waiting ? <LoadingSpinner/> : null;
		const titles = this.props.titles.map((unlock) => {
			const title = unlock.title;
			title.unlockId = unlock.id;
			return title;
		});
		const select2Options = {
			width: "100%",
			allowClear: true
		};


		return (
			<form
				className="form-horizontal"
				onSubmit={this.handleSubmit}
			>
				{loadingElement}
				<Input
					defaultValue={this.state.bio}
					label="Bio"
					labelClassName="col-md-3"
					ref={(ref) => this.bio = ref}
					type="textarea"
					wrapperClassName="col-md-9"
				/>
				<Select
					idAttribute="unlockId"
					label="Title"
					labelAttribute="title"
					labelClassName="col-md-4"
					options={titles}
					placeholder="Select title"
					ref={(ref) => this.title = ref}
					wrapperClassName="col-md-4"
				/>
				<SearchSelect
					noDefault
					collection="area"
					defaultValue={injectDefaultAliasName(this.state.area)}
					label="Area"
					labelClassName="col-md-4"
					placeholder="Select area..."
					ref={(ref) => this.area = ref}
					select2Options={select2Options}
					wrapperClassName="col-md-4"
				/>
				<div className="form-group">
					<div className="col-md-4 col-md-offset-4">
						<Button
							block
							bsSize="large"
							bsStyle="primary"
							type="submit"
						>
							Update!
						</Button>
					</div>
				</div>
			</form>
		);
	}
}

ProfileForm.displayName = 'ProfileForm';
ProfileForm.propTypes = {
	editor: React.PropTypes.shape({
		id: React.PropTypes.number,
		area: validators.labeledProperty,
		bio: React.PropTypes.string,
		titleUnlockId: React.PropTypes.number
	}),
	titles: React.PropTypes.array
};

module.exports = ProfileForm;
