var React = require('react');

var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Select = require('../../input/select.jsx');

var AliasRow = React.createClass({
	getValue: function() {
		return {
			name: this.refs.name.getValue(),
			sortName: this.refs.sortName.getValue(),
			language: this.refs.language.getValue()
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
			<div className='row margin-top-1'>
				<div className='col-md-11 text-center' onChange={this.props.onChange}>
					<Input
						type='text'
						defaultValue={this.props.name}
						label='Name'
						bsStyle={this.validationState()}
						ref='name'
						labelClassName='margin-left-1 margin-right-1' /> &nbsp;
					<Input
						type='text'
						defaultValue={this.props.sortName}
						label='Sort Name'
						bsStyle={this.validationState()}
						ref='sortName'
						labelClassName='margin-left-1 margin-right-1' /> &nbsp;
					<Select
						label='Language'
						labelAttribute='name'
						idAttribute='id'
						ref='language'
						defaultValue={this.props.language}
						bsStyle={this.validationState()}
						labelClassName='margin-left-1 margin-right-1'
						placeholder='Select alias language…'
						noDefault
						options={this.props.languages} />
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
			language: null
		});

		existing.forEach(function(alias, i) {
			alias.key = i;
			alias.valid = true;
		});

		return {
			aliases: existing,
			rowsSpawned: existing.length
		};
	},
	getValue: function() {
		return this.state.aliases.slice(0, -1).map(function(alias) {
			var data = {
				name: alias.name,
				sortName: alias.sortName,
				languageId: parseInt(alias.language),
				dflt: false,
				primary: true
			};

			if (alias.id) {
				data.id = alias.id;
			}

			return data;
		});
	},
	handleChange: function(index) {
		var updatedAliases = this.state.aliases.slice();
		var updatedAlias = this.refs[index].getValue();

		updatedAliases[index] = {
			name: updatedAlias.name,
			sortName: updatedAlias.sortName,
			language: updatedAlias.language,
			key: updatedAliases[index].key,
			valid: this.refs[index].getValid()
		};

		if (this.state.aliases[index].id) {
			updatedAliases[index].id = this.state.aliases[index].id;
		}

		var rowsSpawned = this.state.rowsSpawned;
		if (index == this.state.aliases.length - 1) {
			updatedAliases.push({
				name: '',
				sortName: '',
				language: null,
				key: rowsSpawned,
				valid: true
			});

			rowsSpawned++;
		}

		this.setState({
			aliases: updatedAliases,
			rowsSpawned: rowsSpawned
		});
	},
	valid: function() {
		return this.state.aliases.every(function(alias) {
			return alias.valid;
		});
	},
	handleRemove: function(index) {
		var updatedAliases = this.state.aliases.slice();

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
					name={alias.name}
					sortName={alias.sortName}
					language={alias.language}
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
				<div className='form-inline'>
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
