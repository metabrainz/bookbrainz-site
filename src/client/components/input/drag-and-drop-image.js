const React = require('react');
const Input = require('react-bootstrap').Input;

/**
* This class is derived from the React Component base class and renders
* an image which supports drag and drop functionality.
*/
class DragAndDropImage extends React.Component {
	/**
	* Binds the class methods to their respective data.
	* @constructor
	*/
	constructor() {
		super();
		this.handleDragStart = this.handleDragStart.bind(this);
	}
	/**
	* Transfers the data of the achievement badge component properties to the
	* DragAndDrop event, which in turn transfers the data on handleDrop to that
	* of the achievement badge which will be showcased on editor's
	* public profile.
	* @param {object} ev - Passed in the function to be initialized with data
	* onDragStart.
	*/
	handleDragStart(ev) {
		const data = {
			id: this.props.achievementId,
			src: this.props.src,
			name: this.props.achievementName
		};
		ev.dataTransfer.setData('text', JSON.stringify(data));
	}
	/**
	* Renders an image of a particular achievement badge, which can be dragged
	* to set the user's publicly showcased achievements
	* @returns {ReactElement} - The rendered image element.
	*/
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
