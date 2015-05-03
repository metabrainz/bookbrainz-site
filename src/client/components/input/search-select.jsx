var React = require('react');
var Select = require('./select.jsx');
var _ = require('underscore');
var $ = require('jquery');

var SearchSelect = React.createClass({
	getValue: function() {
		return this.refs.select.getValue();
	},
	render: function() {
		var self = this;
		var select2Options = _.clone(this.props.select2Options) || {};

		_.extend(select2Options, {
			ajax: {
				url: '/search',
				minimumInputLength: 1,
				data: function(params) {
					var queryParams = {
						q: params.term,
						page: params.page,
						mode: 'auto',
						collection: self.props.collection
					};

					return queryParams;
				},
				processResults: function(results) {
					var data = {
						results: []
					};

					results.forEach(function(result) {
						data.results.push({
							id: result.bbid,
							text: result.default_alias ?
								  result.default_alias.name : '(unnamed)',
							disambiguation: result.disambiguation ?
								            result.disambiguation.comment : null
						});
					});

					return data;
				}
			},
			templateResult: function(result) {
				var template = result.text;

				if (result.disambiguation) {
					template += React.renderToStaticMarkup(
						<span
							className='disambig'>
							({result.disambiguation})
						</span>
					);
				}

				return $.parseHTML(template);
			}
		});

		return (
			<Select
				placeholder={this.props.placeholder}
				value={this.props.value}
				defaultValue={this.props.defaultValue}
				label={this.props.label}
				help={this.props.help}
				bsStyle={this.props.bsStyle}
				ref='select'
				groupClassName={this.props.groupClassName}
				wrapperClassName={this.props.wrapperClassName}
				labelClassName={this.props.labelClassName}
				noDefault
				onChange={this.props.onChange}
				select2Options={select2Options}
				options={this.props.options}/>
		);
	}
});

module.exports = SearchSelect;
