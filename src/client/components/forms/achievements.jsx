const React = require('react');
const request = require('superagent-bluebird-promise');
const Achievement = require('./parts/achievement.jsx');

(() => {
	'use strict';

	class AchievementForm extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				editor: props.editor,
				achievement: props.achievement
			};
		}
		handleSubmit(event) {
			event.preventDefault();

			const data = {
				id: this.state.editor.id,
				rank1: this.rank1,
				rank2: this.rank2,
				rank3: this.rank3
			};

			request.post('/editor/:id/achievements')
				.send(data)
				.then(() => {
					window.location.href = `/editor/${this.state.editor.id}`;
				})
				.catch((res) => {
					const error = res.body.error;
					this.setState({
						error,
						waiting: false
					});
				});
		}
		render() {
			const achievements = this.state.achievement.model
					.map((achievement) => {
						let achievementHTML;
						if (achievement.unlocked) {
							achievementHTML = (
								<Achievement achievement={achievement}/>
							);
						}
						return achievementHTML;
					});
			const locked = this.state.achievement.model.map((achievement) => {
				let achievementHTML = null;
				if (!achievement.unlocked) {
					achievementHTML = (
						<Achievement achievement={achievement}/>
					);
				}
				return achievementHTML;
			});

			const rankName = this.state.achievement.model.map((achievement) => {
				let optionHTML = null;
				if (achievement.unlocked) {
					optionHTML = (<option value={achievement.id}>
						{achievement.name}
					</option>);
				}
				return optionHTML;
			});

			const nullOption = (<option value="none"> </option>);

			let rankUpdate;
			console.log(this.state.editor.authenticated);
			if (this.state.editor.authenticated) {
				rankUpdate = (
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
			}
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
	}

	AchievementForm.displayName = 'AchievementForm';
	AchievementForm.propTypes = {
		achievement: React.PropTypes.object,
		editor: React.PropTypes.object
	};

	module.exports = AchievementForm;
})();
