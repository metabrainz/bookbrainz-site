const React = require('react');
const Input = require('react-bootstrap').Input;

module.exports = React.createClass({
	displayName: 'DragAndDrop',
	propTypes: {
		name: React.PropTypes.string
	},
	getInitialState() {
		'use strict';
		return {achievement: {}};
	},
	handleDragOver(ev) {
		'use strict';
		ev.preventDefault();
	},
	addChild(data) {
		'use strict';
		this.setState({achievement: data});
	},
	handleDrop(ev) {
		'use strict';
		ev.preventDefault();
		let data;

		try {
			data = JSON.parse(ev.dataTransfer.getData('text'));
		}
		catch (err) {
			return;
		}
		this.addChild(data);
	},
	getValue() {
		'use strict';
		return this.target.getValue();
	},
	render() {
		'use strict';
		return (
			<div className="well col-sm-4"
				onDragOver={this.handleDragOver}
				onDrop={this.handleDrop}
			>
			<Input
				name={this.props.name}
				type="hidden"
				value={this.state.achievement.id}
			/>
			<img
				className="center-block"
				height="100px"
				src={this.state.achievement.src}
			/>
				<div className="center-block h2">
					{this.state.achievement.name}
				</div>
			</div>
		);
	}
});
