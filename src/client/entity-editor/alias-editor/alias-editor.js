/*
 * Copyright (C) 2016  Ben Ockmore
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


import {Button, Col, Modal, Row} from 'react-bootstrap';
import {addAliasRow, hideAliasEditor} from './actions';
import AliasRow from './alias-row';
import React from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';

/**
 * Container component. The AliasEditor component contains a number of AliasRow
 * elements, and renders these inside a modal, which appears when the show
 * property of the component is set.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.aliases - The list of aliases to be rendered in the
 *        editor.
 * @param {Array} props.languageOptions - The list of possible languages for an
 *        alias.
 * @param {Function} props.onAddAlias - A function to be called when the button
 *        to add an alias is clicked.
 * @param {Function} props.onClose - A function to be called when the button to
 *        close the editor is clicked.
 * @param {boolean} props.show - Whether or not the editor modal should be
 *        visible.
 * @returns {ReactElement} React element containing the rendered AliasEditor.
 **/
const AliasEditor = ({
	aliases,
	languageOptions,
	onAddAlias,
	onClose,
	show
}) => {
	const noAliasesTextClass =
		classNames('text-center', {hidden: aliases.size});
	return (
		<Modal bsSize="large" show={show} onHide={onClose}>
			<Modal.Header>
				<Modal.Title>
					Alias Editor
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<div className={noAliasesTextClass}>
					<p className="text-muted">This entity has no aliases</p>
				</div>
				<div>
					{
						aliases.map((alias, rowId) =>
							<AliasRow
								index={rowId}
								key={rowId}
								languageOptions={languageOptions}
							/>
						).toArray()
					}
				</div>
				<Row>
					<Col className="text-right" md={3} mdOffset={9}>
						<Button bsStyle="success" onClick={onAddAlias}>
							Add alias
						</Button>
					</Col>
				</Row>
			</Modal.Body>

			<Modal.Footer>
				<Button bsStyle="primary" onClick={onClose}>Close</Button>
			</Modal.Footer>
		</Modal>
	);
};
AliasEditor.displayName = 'AliasEditor';
AliasEditor.propTypes = {
	aliases: React.PropTypes.array,
	languageOptions: React.PropTypes.array,
	onAddAlias: React.PropTypes.func,
	onClose: React.PropTypes.func,
	show: React.PropTypes.bool
};


function mapDispatchToProps(dispatch) {
	return {
		onAddAlias: () => dispatch(addAliasRow()),
		onClose: () => dispatch(hideAliasEditor())
	};
}

function mapStateToProps(rootState) {
	return {
		aliases: rootState.get('aliasEditor')
	};
}


export default connect(mapStateToProps, mapDispatchToProps)(AliasEditor);
