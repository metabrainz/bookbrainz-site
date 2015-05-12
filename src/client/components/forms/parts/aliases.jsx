var React = require('react');

var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Select = require('../../input/select.jsx');

var AliasRow = React.createClass({
	getValue: function() {
		return {
			id: this.refs.id.getValue(),
			name: this.refs.name.getValue(),
			sortName: this.refs.sortName.getValue(),
			language: this.refs.language.getValue() || null,
			primary: this.refs.primary.getChecked(),
			default: this.refs.default.getChecked()
		};
	},
	validationState: function() {
		if (this.props.name || this.props.sortName) {
			if (this.props.name && this.props.sortName) {
				return 'success';
			}
			else {
				return 'error';
			}
		}

		return null;
	},
	getValid: function() {
		return Boolean(this.refs.name.getValue() && this.refs.sortName.getValue());
	},
	render: function() {
		return (
			<div className='row' onChange={this.props.onChange}>
				<Input
					type='hidden'
					defaultValue={this.props.aliasId}
					ref='id' />
				<div className='col-md-3'>
					<Input
						type='text'
						defaultValue={this.props.name}
						bsStyle={this.validationState()}
						wrapperClassName='col-md-11'
						ref='name' /> &nbsp;
				</div>
				<div className='col-md-3'>
					<Input
						type='text'
						defaultValue={this.props.sortName}
						bsStyle={this.validationState()}
						wrapperClassName='col-md-11'
						ref='sortName' /> &nbsp;
				</div>
				<div className='col-md-3'>
					<Select
						labelAttribute='name'
						idAttribute='id'
						ref='language'
						defaultValue={this.props.language}
						bsStyle={this.validationState()}
						wrapperClassName='col-md-11'
						placeholder='Select alias language…'
						noDefault
						options={this.props.languages} />
				</div>
				<div className='col-md-1'>
					<Input type='checkbox' ref='primary' defaultChecked={this.props.primary} wrapperClassName='col-md-11' label=' '/>
				</div>
				<div className='col-md-1'>
					<Input type='radio' ref='default' defaultChecked={this.props.default} wrapperClassName='col-md-11' label=' ' name='default' />
				</div>
				<div className='col-md-1 text-right'>
					<Button bsStyle='danger' className={this.props.removeHidden ? 'hidden' : ''} onClick={this.props.onRemove}>
						<span className='fa fa-times' />
					</Button>
				</div>
			</div>
		);
	}
});

var AliasList = React.createClass({
	getInitialState: function() {
		var existing = this.props.aliases || [];
		existing.push({
			name: '',
			sortName: '',
			language: null,
			primary: true,
			default: false
		});

		existing.forEach(function(alias, i) {
			alias.key = i;
		});

		if(existing.length == 1) {
			// Set default alias as first row in "create" form.
			existing[0].default = true;
		}

		return {
			aliases: existing,
			rowsSpawned: existing.length
		};
	},
	getValue: function() {
		var aliases = [];
		var numRows = this.state.aliases.length;

		for (var i = 0; i < numRows; i++) {
			aliases.push(this.refs[i].getValue());
		}

		return aliases;
	},
	handleChange: function(index) {
		var self = this;
		var updatedAlias = this.refs[index].getValue();
		var alias = this.getValue();

		if (!alias.sortName && updatedAlias.sortName
				|| alias.sortName && !updatedAlias.sortName
				|| !alias.name && updatedAlias.name
				|| alias.name && !updatedAlias.name) {
			var updatedAliases = this.getValue();

			updatedAliases.forEach(function(alias, idx) {
				alias.key = self.state.aliases[idx].key;
			});

			var rowsSpawned = this.state.rowsSpawned;
			if (index == this.state.aliases.length - 1) {
				updatedAliases.push({
					name: '',
					sortName: '',
					language: null,
					primary: true,
					default: false,
					key: rowsSpawned++
				});
			}

			this.setState({
				aliases: updatedAliases,
				rowsSpawned: rowsSpawned
			});
		}
	},
	valid: function() {
		var defaultSet = false;
		var numRows = this.state.aliases.length;

		for (var i = 0; i < numRows; i++) {
			var aliasRow = this.refs[i];
			var alias = aliasRow.getValue();

			if (aliasRow.getValid() === false && numRows > 1 && (alias.name || alias.sortName)) {
				return false;
			}
			else if (!defaultSet) {
				defaultSet = alias.default;
			}
		}

		return defaultSet || numRows == 1;
	},
	handleRemove: function(index) {
		var updatedAliases = this.getValue().slice();

		if (index != this.state.aliases.length - 1) {
			updatedAliases.splice(index, 1);

			this.setState({
				aliases: updatedAliases
			});
		}
	},
	render: function() {
		var self = this;

		var rows = this.state.aliases.map(function(alias, index) {
			return (
				<AliasRow
					key={alias.key}
					ref={index}
					aliasId={alias.id}
					name={alias.name}
					sortName={alias.sortName}
					language={alias.language}
					primary={alias.primary}
					default={alias.default}
					languages={self.props.languages}
					onChange={self.handleChange.bind(null, index)}
					onRemove={self.handleRemove.bind(null, index)}
					removeHidden={index == self.state.aliases.length - 1} />
			);
		});

		return (
			<div className={(this.props.visible === false) ? 'hidden': '' }>
				<h2>Add Aliases</h2>
				<p className='lead'>Add some aliases to the entity.</p>
				<div className='form-horizontal'>
					<div className='row margin-top-1'>
						<label className='col-md-3'>Name</label>
						<label className='col-md-3'>Sort Name</label>
						<label className='col-md-3'>Language</label>
						<label className='col-md-1'>Primary</label>
						<label className='col-md-1'>Default</label>
					</div>
					{rows}
				</div>
				<div className='margin-top-1 row'>
					<div className='col-md-1 col-md-offset-11'>
						<Button bsStyle='success' block onClick={this.props.nextClick}>
							Next <span className='fa fa-angle-double-right' />
						</Button>
					</div>
				</div>
			</div>
		);

	}
});

module.exports = AliasList;
