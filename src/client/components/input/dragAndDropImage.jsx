const React = require('react');
const Input = require('react-bootstrap').Input;

module.exports = React.createClass({
	displayName: 'DragAndDropImage',
	propTypes: {
		achievementId: React.PropTypes.string,
		achievementName: React.PropTypes.string,
		height: React.PropTypes.string,
		src: React.PropTypes.string
	},
	handleDragStart(ev) {
		'use strict';
		const data = {
			id: this.props.achievementId,
			src: this.props.src,
			name: this.props.achievementName
		};
		ev.dataTransfer.setData('text', JSON.stringify(data));
	},
	render() {
		'use strict';
		return (
			<img
				draggable="true"
				height={this.props.height}
				src={this.props.src}
				onDragStart={this.handleDragStart}
			/>
		);
	}
});
