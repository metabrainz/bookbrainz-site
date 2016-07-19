const React = require('react');

const Achievement = React.createClass({
	displayName: 'achievement',
	propTypes: {
		achievement: React.PropTypes.shape({
			badgeUrl: React.PropTypes.string,
			description: React.PropTypes.string,
			name: React.PropTypes.string
		})
	},
	getInitialState() {
		'use strict';

		return {
			achievement: this.props.achievement
		};
	},
	render() {
		'use strict';

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
		);
	}
});

module.exports = Achievement;
