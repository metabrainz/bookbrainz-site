const React = require('react');

const Achievement = React.createClass({
	displayName: 'achievement',
	getInitialState() {
		'use strict';
		
		return {
			achievement: this.props.achievement
		};
	},
	render() {
		return (
			<div className="row well">
				<div className="col-md-2">
					<img
						height="100px"
						src={this.props.achievement.badgeUrl}
					/>
				</div>
				<div className="col-md-8">
					<div className="h2">
						{this.props.achievement.name}
					</div>
					<p>{this.props.achievement.description}</p>
				</div>
			</div>
		)
	}
});

module.exports = Achievement;
