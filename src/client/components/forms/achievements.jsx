const React = require('react');

module.exports = React.createClass({
	displayName: 'AchievementForm',
	render() {
		'use strict';
		const achievements = this.props.achievement.model.map(function(achievement) {
			if (achievement.unlocked) {
				return (
					<div className="row well">
						<div className="col-md-2">
							<img height="100px" src={achievement.badgeUrl}></img>
						</div>
						<div className="col-md-8">
							<div className="h2">
								{achievement.name}
							</div>
							<p>{achievement.description}</p>
						</div>
					</div>
				);
			}
		});

		return (
			<div>
				<div className="h1">Unlocked Achievements</div>
				{achievements}
			</div>
		);
	}
});
