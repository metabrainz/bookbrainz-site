var React = require('react');
var Input = require('react-bootstrap').Input;

var Select = React.createClass({
  getValue: function() {
    return this.refs.input.getValue()
  },
  handleChange: function() {
    if(this.props.onChange) {
      this.props.onChange();
    }
  },
  render: function() {
    var self = this;
    var options = [];
    if(this.props.options) {
      options = this.props.options.map(function(op) {
        return (
            <option key={op[self.props.idAttribute]} value={op[self.props.idAttribute]}>
              {op[self.props.labelAttribute]}
            </option>
          );
      });
    }

    if(this.props.noDefault) {
      options.unshift(<option key='0'></option>);
    }

    return (
      <Input
        type='select'
        placeholder={this.props.placeholder}
        value={this.props.value}
        defaultValue={this.props.defaultValue}
        label={this.props.label}
        help={this.props.help}
        bsStyle={this.props.bsStyle}
        ref='input'
        groupClassName={this.props.groupClassName}
        wrapperClassName={this.props.wrapperClassName}
        labelClassName={this.props.labelClassName}
        multiple={this.props.multiple}
        onChange={this.handleChange}>
        {options}
      </Input>
    );
  }
});



module.exports = Select;
