var React = require('react');
var Input = require('react-bootstrap').Input;

var Select = React.createClass({
  render: function() {
    var self = this;
    var options = this.props.options.map(function(op) {
      return (
          <option key={op[self.props.idAttribute]} value={op[self.props.idAttribute]}>
            {op[self.props.labelAttribute]}
          </option>
        );
    });

    return (
      <Input
        type='select'
        placeholder={this.props.placeholder}
        label={this.props.label}
        help={this.props.help}
        groupClassName={this.props.groupClassName}
        wrapperClassName={this.props.wrapperClassName}
        labelClassName={this.props.labelClassName}
        multiple={this.props.multiple}>
        {options}
      </Input>
    );
  }
});



module.exports = Select;
