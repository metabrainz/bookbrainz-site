var React = require('react');

var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Select = require('../../input/select.jsx');

var IdentifierRow = React.createClass({
	getValue: function() {
		return {
			type: parseInt(this.refs.type.getValue()),
			value: this.refs.value.getValue(),
		};
	},
	validationState: function() {
		var self = this;
		if (this.props.type) {
			var type = this.props.types.filter(function(testType) {
				return testType.id == self.props.type;
			})[0];

			var regex = new RegExp(type.validation_regex);

			if (regex.test(this.props.value)) {
				return 'success';
			} else {
				return 'error';
			}
		} else if (this.props.value) {
			return false;
		} else {
			return null;
		}
	},
	getValid: function() {
		var value = this.refs.value.getValue();
		var typeId = parseInt(this.refs.type.getValue());

		var type = this.props.types.filter(function(type) {
			return type.id == typeId;
		});

		if(type.length) {
			type = type[0];
			var regex = new RegExp(type.validation_regex);
			return regex.test(value);
		} else {
			return false;
		}
	},
	render: function() {
		return (
			<div className='row'>
				<div className='col-md-4'>
					<Select
						labelAttribute='label'
						idAttribute='id'
						ref='type'
						value={this.props.type}
						bsStyle={this.validationState()}
						wrapperClassName='col-md-12'
						placeholder='Select identifier type…'
						noDefault
						options={this.props.types}
						onChange={this.props.onChange}/>
				</div>
				<div className='col-md-4'>
					<Input
						type='text'
						value={this.props.value}
						bsStyle={this.validationState()}
						wrapperClassName='col-md-12'
						ref='value'
						onChange={this.props.onChange}/>
				</div>
				<div className='col-md-2'>
					<Button bsStyle='danger' className={this.props.removeHidden ? 'hidden' : ''} onClick={this.props.onRemove}>
						<span className='fa fa-times' />
					</Button>
				</div>
			</div>
		);
	}
});

var IdentifierList = React.createClass({
	getInitialState: function() {
		var existing = this.props.identifiers || [];
		existing.push({
			value: '',
			type: null
		});

		existing.forEach(function(identifier, i) {
			identifier.key = i;
			identifier.valid = true;
		});

		return {
			identifiers: existing,
			rowsSpawned: existing.length
		};
	},
	getValue: function() {
		return this.state.identifiers.slice(0, -1).map(function(identifier) {
			var data = {
				value: identifier.value,
				typeId: identifier.type
			};

			if (identifier.id) {
				data.id = identifier.id;
			}

			return data;
		});
	},
	handleChange: function(index) {
		var updatedIdentifiers = this.state.identifiers.slice();
		var updatedIdentifier = this.refs[index].getValue();

		// Attempt to guess the type
		var newValue = updatedIdentifier.value;
		this.props.types.forEach(function(type) {
			if(type.detection_regex) {
				var detectionRegex = new RegExp(type.detection_regex);
				var regexResult = detectionRegex.exec(updatedIdentifier.value);
				if (regexResult) {
					// Don't assign directly to updatedIdentifier, to avoid
					// multiple transformations.
					newValue = regexResult[1];
					updatedIdentifier.type = type.id;
				}
			}
		});
		updatedIdentifier.value = newValue;

		updatedIdentifiers[index] = {
			value: updatedIdentifier.value,
			type: updatedIdentifier.type,
			key: updatedIdentifiers[index].key,
			valid: this.refs[index].getValid()
		};

		if (this.state.identifiers[index].id) {
			updatedIdentifiers[index].id = this.state.identifiers[index].id;
		}

		var rowsSpawned = this.state.rowsSpawned;
		if (index == this.state.identifiers.length - 1) {
			updatedIdentifiers.push({
				value: '',
				type: null,
				key: rowsSpawned,
				valid: true
			});

			rowsSpawned++;
		}

		this.setState({
			identifiers: updatedIdentifiers,
			rowsSpawned: rowsSpawned
		});
	},
	valid: function() {
		return this.state.identifiers.every(function(identifier) {
			return identifier.valid;
		});
	},
	handleRemove: function(index) {
		var updatedIdentifiers = this.state.identifiers.slice();

		if (index != this.state.identifiers.length - 1) {
			updatedIdentifiers.splice(index, 1);

			this.setState({
				identifiers: updatedIdentifiers
			});
		}
	},
	render: function() {
		var self = this;

		var rows = this.state.identifiers.map(function(identifier, index) {
			return (
				<IdentifierRow
					key={identifier.key}
					ref={index}
					value={identifier.value}
					type={identifier.type}
					types={self.props.types}
					onChange={self.handleChange.bind(null, index)}
					onRemove={self.handleRemove.bind(null, index)}
					removeHidden={index == self.state.identifiers.length - 1} />
			);
		});

		return (
			<div>
				<div className='row margin-top-1'>
					<label className='col-md-3 text-right'>Identifiers</label>
					<label className='col-md-3 text-center'>Type</label>
					<label className='col-md-3 text-center'>Value</label>
				</div>
				<div className='row'>
					<div className='col-md-9 col-md-offset-3'>
						{rows}
					</div>
				</div>
			</div>
		);
	}
});

module.exports = IdentifierList;
