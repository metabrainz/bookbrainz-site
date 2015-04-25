var React = require('react');

var Aliases = require('./parts/aliases.jsx');
var RevisionNote = require('./parts/revisionNote.jsx');
var PublisherData = require('./parts/publisherData.jsx');
var LoadingSpinner = require('../loading_spinner.jsx');

var request = require('superagent');
require('superagent-bluebird-promise');

var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;

module.exports = React.createClass({
	getInitialState: function() {
		return {
			tab: 1,
			aliasesValid: true,
			dataValid: true,
			waiting: false
		}
	},
	setTab: function(tab) {
		this.setState({
			tab: tab,
			aliasesValid: this.refs.aliases.valid(),
			dataValid: this.refs.data.valid()
		})
	},
	backClick: function() {
		this.setTab(this.state.tab - 1);
	},
	nextClick: function() {
		this.setTab(this.state.tab + 1);
	},
	handleTab: function(tabKey) {
		this.setTab(tabKey);
	},
	handleSubmit: function(e) {
		e.preventDefault();

		var aliasData = this.refs.aliases.getValue();
		var publisherData = this.refs.data.getValue();
		var revisionNote = this.refs.revision.refs.note.getValue();
		var data = {
			aliases: this.refs.aliases.getValue().map(function(alias) {
				return {
					name: alias.name,
					sortName: alias.sortName,
					languageId: parseInt(alias.language),
					dflt: false,
					primary: true
				};
			}),
			beginDate: publisherData.beginDate,
			endDate: publisherData.endDate,
			ended: (publisherData.ended === 'on' ? true : false),
			publisherTypeId: parseInt(publisherData.publisherType),
			disambiguation: publisherData.disambiguation,
			annotation: publisherData.annotation,
			note: revisionNote
		};

		if (data.aliases.length !== 0) {
			data.aliases[0].dflt = true;
		}

		this.setState({waiting: true});

		var self = this;
		request.post('/publisher/create/handler')
			.send(data).promise()
			.then(function(revision) {
				if (!revision.body || !revision.body.entity) {
					window.location.replace('/login');
					return;
				}
				window.location.href = '/publisher/' + revision.body.entity.entity_gid;
			})
			.catch(function(err) {
				self.setState({error: err});
			});
	},
	render: function() {
		var aliases = null;
		if (this.props.publisher) {
			aliases = this.props.publisher.aliases.map(function(alias) {
				return {
					name: alias.name,
					sortName: alias.sort_name,
					language: null
				};
			});
		}

		var submitEnabled = (this.state.aliasesValid && this.state.dataValid);

		if (this.state.waiting) {
			var loadingElement = <LoadingSpinner />;
		}

		return (
			<div>
				{loadingElement}

				<Nav bsStyle='tabs' activeKey={this.state.tab} onSelect={this.handleTab}>
					<NavItem eventKey={1}>
						<strong>1.</strong> Aliases <span className={'text-danger fa fa-warning' + (this.state.aliasesValid ? ' hidden' : '')} />
					</NavItem>
					<NavItem eventKey={2}>
						<strong>2.</strong> Data <span className={'text-danger fa fa-warning' + (this.state.dataValid ? ' hidden' : '')} />
					</NavItem>
					<NavItem eventKey={3}>
						<strong>3.</strong> Revision Note
					</NavItem>
				</Nav>


				<form onChange={this.handleChange}>
					<Aliases aliases={aliases} languages={this.props.languages} ref='aliases' nextClick={this.nextClick} visible={this.state.tab == 1}/>
					<PublisherData ref='data' publisherTypes={this.props.publisherTypes} backClick={this.backClick} nextClick={this.nextClick} visible={this.state.tab == 2}/>
					<RevisionNote backClick={this.backClick} ref='revision' visible={this.state.tab == 3} submitDisabled={!submitEnabled} onSubmit={this.handleSubmit}/>
				</form>
			</div>
		);
	}
});
