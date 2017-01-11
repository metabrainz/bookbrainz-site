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
import {addAlias, hideAliasEditor} from './actions';
import AliasRow from './alias-row';
import React from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';

const AliasEditor = ({
	aliases,
	languageOptions,
	onAddButtonClick,
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
						<Button bsStyle="success" onClick={onAddButtonClick}>
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
	show: React.PropTypes.bool,
	onAddButtonClick: React.PropTypes.func,
	onClose: React.PropTypes.func
};


function mapDispatchToProps(dispatch) {
	return {
		onClose: () => dispatch(hideAliasEditor()),
		onAddButtonClick: () => dispatch(addAlias())
	};
}

function mapStateToProps(rootState) {
	return {
		aliases: rootState.get('aliasEditor')
	};
}


export default connect(mapStateToProps, mapDispatchToProps)(AliasEditor);
