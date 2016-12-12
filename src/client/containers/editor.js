const React = require('react');

const bootstrap = require('react-bootstrap');

const Row = bootstrap.Row;
const Col = bootstrap.Col;
const Nav = bootstrap.Nav;
const NavItem = bootstrap.NavItem;

const injectChildElemsWithProps =
	require('../helpers/utils').injectChildElemsWithProps;

class EditorContainer extends React.Component {

	render() {
		const children = injectChildElemsWithProps(this.props);
		const {tabActive, editor} = this.props;

		return (
			<div>
				<Row>
					<Col md={12}>
						{editor.title ?
						<div>
							<a
								href=" "
								title={editor.title.description}
							>
								<h1>
									{`${editor.title.title} ${editor.name}`}
								</h1>
							</a>
						</div> :
						<h1>
							{editor.name}
						</h1>
						}
					</Col>
				</Row>
				<Row>
					<Col md={12}>
						<Nav bsStyle="tabs">
							<NavItem
								active={tabActive === 0}
								href={`/editor/${editor.id}`}
							>
								Profile
							</NavItem>
							<NavItem
								active={tabActive === 1}
								href={`/editor/${editor.id}/revisions`}
							>
								Revisions
							</NavItem>
							<NavItem
								active={tabActive === 2}
								href={`/editor/${editor.id}/achievements`}
							>
								Achievements
							</NavItem>
						</Nav>
					</Col>
				</Row>
				{children}
			</div>
		);
	}
}

EditorContainer.displayName = 'EditorContainer';
EditorContainer.propTypes = {
	editor: React.PropTypes.shape({
		title: React.PropTypes.object,
		name: React.PropTypes.string,
		id: React.PropTypes.number
	}),
	tabActive: React.PropTypes.number.isRequired
};

module.exports = EditorContainer;
