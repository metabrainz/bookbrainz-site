const React = require('react');
(function() {
	'use strict';
	class Achievement extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				achievement: props.achievement
			};
		}
		render() {
			return (
				<div className="row well">
					<div className="col-md-2">
						<img
							height="100px"
							src={this.state.achievement.badgeUrl}
						/>
					</div>
					<div className="col-md-8">
						<div className="h2">
							{this.state.achievement.name}
						</div>
						<p>{this.state.achievement.description}</p>
					</div>
				</div>
			);
		}
	}

	Achievement.displayName = 'achievement';

	Achievement.propTypes = {
		achievement: React.PropTypes.shape({
			badgeUrl: React.PropTypes.string,
			description: React.PropTypes.string,
			name: React.PropTypes.string
		})
	};

	module.exports = Achievement;
})();
