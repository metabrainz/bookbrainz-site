var React = require('react');
var Input = require('react-bootstrap').Input;

var uuid_re =
  /[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}/;

var UUIDInput = React.createClass({
  getInitialState: function() {
    return {
      value: '',
      valid: false,
    };
  },

  validationState: function() {
    if (this.state.valid) {
      return 'success';
    } else {
      return 'error';
    }
  },
  handleChange: function() {
    // This could also be done using ReactLink:
    // http://facebook.github.io/react/docs/two-way-binding-helpers.html

    var result = uuid_re.exec(this.refs.input.getValue());

    var valid = Boolean(result);
    if (valid) {
      result = result[0];
    } else {
      result = this.refs.input.getValue();
    }

    this.setState({
        value: result,
        valid: valid,
    });
  },
  render: function() {
    return (
      <Input
        type='text'
        value={this.state.value}
        placeholder={this.props.placeholder}
        label={this.props.label}
        help={this.props.help}
        bsStyle={this.validationState()}
        ref='input'
        groupClassName={this.props.groupClassName}
        wrapperClassName={this.props.wrapperClassName}
        labelClassName={this.props.labelClassName}
        onChange={this.handleChange} />
    );
  }
});

module.exports = UUIDInput;
