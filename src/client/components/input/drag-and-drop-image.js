const React = require('react');
const Input = require('react-bootstrap').Input;

class DragAndDropImage extends React.Component {
	constructor() {
		super();
		this.handleDragStart = this.handleDragStart.bind(this);
	}
	handleDragStart(ev) {
		const data = {
			id: this.props.achievementId,
			src: this.props.src,
			name: this.props.achievementName
		};
		ev.dataTransfer.setData('text', JSON.stringify(data));
	}
	render() {
		return (
			<img
				draggable="true"
				height={this.props.height}
				src={this.props.src}
				onDragStart={this.handleDragStart}
			/>
		);
	}
}

DragAndDropImage.displayName = 'DragAndDropImage';
DragAndDropImage.propTypes = {
	achievementId: React.PropTypes.number,
	achievementName: React.PropTypes.string,
	height: React.PropTypes.string,
	src: React.PropTypes.string
};

module.exports = DragAndDropImage;
