const React = require('react');
const request = require('superagent-bluebird-promise');

module.exports = React.createClass({
	displayName: 'AchievementForm',
	propTypes: {
		achievement: React.PropTypes.object,
		editor: React.PropTypes.object
	},
	handleSubmit(event) {
		'use strict';

		event.preventDefault();

		const data = {
			id: this.props.editor.id,
			rank1: this.rank1,
			rank2: this.rank2,
			rank3: this.rank3
		};

		request.post('/editor/:id/achievements')
			.send(data)
			.then(() => {
				window.location.href = '/editor/:id';
			})
			.catch((res) => {
				const error = res.body.error;
				this.setState({
					error,
					waiting: false
				});
			});
	},
	render() {
		'use strict';
		const achievements = this.props.achievement.model.map((achievement) => {
			let achievementHTML;
			if (achievement.unlocked) {
				achievementHTML = (
					<div className="row well">
						<div className="col-md-2">
							<img
								height="100px"
								src={achievement.badgeUrl}
							/>
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
			return achievementHTML;
		});
		const locked = this.props.achievement.model.map((achievement) => {
			let achievementHTML = null;
			if (!achievement.unlocked) {
				achievementHTML = (
					<div className="row well">
						<div className="col-md-2">
							<img
								height="100px"
								src={achievement.badgeUrl}
							/>
						</div>
						<div className="col-md-6">
							<div className="h2">
								{achievement.name}
							</div>
							<p>{achievement.description}</p>
						</div>
					</div>
				);
			}
			return achievementHTML;
		});

		const rankName = this.props.achievement.model.map((achievement) => {
			let optionHTML = null;
			if (achievement.unlocked) {
				optionHTML = (<option value={achievement.id}>
					{achievement.name}
				</option>);
			}
			return optionHTML;
		});

		const nullOption = (<option value="none"> </option>);

		const rankUpdate = (
			<form
				className="form-horizontal"
				id="rankSelectForm"
				method="post"
			>
				<div className="form-group">
					<label>Rank 1</label>
					<div className="selectContainer">
						<select
							className="form-control"
							name="rank1"
							value={this.rank1}
						>
							{nullOption}
							{rankName}
						</select>
					</div>
				</div>

				<div className="form-group">
					<label>Rank 2</label>
					<div className="selectContainer">
						<select
							className="form-control"
							name="rank2"
						>
							{nullOption}
							{rankName}
						</select>
					</div>
				</div>

				<div className="form-group">
					<label>Rank 3</label>
					<div className="selectContainer">
						<select
							className="form-control"
							name="rank3"
						>
							{nullOption}
							{rankName}
						</select>
					</div>
				</div>

				<div className="form-group">
					<button
						className="btn btn-default"
						type="submit"
					>
						update
					</button>
				</div>
			</form>
		);
		return (
			<div>
				<div className="h1">Unlocked Achievements</div>
				{achievements}
				{rankUpdate}
				<div className="h1">Locked Achievements</div>
				{locked}
			</div>
		);
	}
});
