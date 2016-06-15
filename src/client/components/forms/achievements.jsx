const React = require('react');

module.exports = React.createClass({
	displayName: 'AchievementForm',
	handleSubmit(event) {
		'use strict';

		event.preventDefault();

		const data = {
			id: this.props.editor.id,
			rank1: this.rank1,
			rank2: this.rank2,
			rank3: this.rank3
		}

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
		const locked = this.props.achievement.model.map(function(achievement) {
			if (!achievement.unlocked) {
				return (
					<div className="row well">
						<div className="col-md-2">
							<img height="100px" src={achievement.badgeUrl}></img>
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
		});

		const rankName = this.props.achievement.model.map(function(achievement) {
			if (achievement.unlocked) {
				return (<option value={achievement.id}>{achievement.name}</option>);
			}
		});

		const nullOption = (<option value="none"> </option>)

		const rankUpdate = (
			<form id="rankSelectForm" method="post" className="form-horizontal">
				<div className="form-group">
					<label>Rank 1</label>
					<div className="selectContainer">
						<select
							name="rank1"
							className="form-control"
							value={this.rank1}>
							{nullOption}
							{rankName}
						</select>
					</div>
				</div>

				<div className="form-group">
					<label>Rank 2</label>
					<div className="selectContainer">
						<select name="rank2" className="form-control">
							{nullOption}
							{rankName}
						</select>
					</div>
				</div>

				<div className="form-group">
					<label>Rank 3</label>
					<div className="selectContainer">
						<select name="rank3" className="form-control">
							{nullOption}
							{rankName}
						</select>
					</div>
				</div>

				<div className="form-group">
					<button type="submit" className="btn btn-default">
						update
					</button>
				</div>
			</form>
		)
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
