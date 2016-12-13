const React = require('react');

const bootstrap = require('react-bootstrap');

const ListGroup = bootstrap.ListGroup;
const ListGroupItem = bootstrap.ListGroupItem;

class EditorRevisionsTab extends React.Component {

	render() {
		const {editor} = this.props;
		const revisions = editor.revisions;

		return (
			<div>
				<h2>Revision History</h2>
				<ListGroup>
					{revisions.map((revision) => {
						const createdDate = new Date(revision.createdAt);
						const dateLabel = Date.now() - createdDate < 86400000 ?
							createdDate.toLocaleTimeString() :
							createdDate.toLocaleDateString();
						const header = (
							<h4 className="list-group-item-heading">
								<small className="pull-right">
									{`${editor.name} - ${dateLabel}`}
								</small>
								{`r${revision.id}`}
							</h4>
						);
						return (
						<ListGroupItem
							href={`/revision/${revision.id}`}
							key={`${editor.id}${revision.id}`}
						>
							{header}
							{revision.note}
						</ListGroupItem>
						);
					})}
				</ListGroup>
			</div>
		);
	}
}

EditorRevisionsTab.displayName = 'EditorRevisionsTab';
EditorRevisionsTab.propTypes = {
	editor: React.PropTypes.shape({
		revisions: React.PropTypes.array,
		name: React.PropTypes.string,
		id: React.PropTypes.number
	})
};

module.exports = EditorRevisionsTab;
