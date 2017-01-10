const React = require('react');
const showEntityType = require('../../../helpers/entity').showEntityType;
const showBeginEndDate = require('../../../helpers/entity').showBeginEndDate;
const showEntityEditions =
	require('../../../helpers/entity').showEntityEditions;
const extractAttribute = require('../../../helpers/entity').extractAttribute;

class PublisherPage extends React.Component {

	static get iconName() {
		return 'university';
	}

	static attributes(entity) {
		return (
			<div>
				{showEntityType(entity.publisherType)}
				<dt>Area</dt>
				<dd>{extractAttribute(entity.area, 'name')}</dd>
				{showBeginEndDate(entity)}
			</div>
		);
	}

	render() {
		const {entity} = this.props;
		return showEntityEditions(entity);
	}
}
PublisherPage.displayName = 'PublisherPage';
PublisherPage.propTypes = {
	entity: React.PropTypes.object
};

module.exports = PublisherPage;
