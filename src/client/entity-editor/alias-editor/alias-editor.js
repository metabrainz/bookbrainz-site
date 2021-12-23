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

import {Button, Col, Modal, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import {addAliasRow, hideAliasEditor, removeEmptyAliases} from './actions';
import {faPlus, faQuestionCircle} from '@fortawesome/free-solid-svg-icons';

import AliasRow from './alias-row';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
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
 */
const AliasEditor = ({
	aliases,
	languageOptions,
	onAddAlias,
	onClose,
	show
}) => {
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		label: language.name,
		value: language.id
	}));

	const noAliasesTextClass =
		classNames('text-center', {hidden: aliases.size});

	const helpText = `Variant names for an entity such as alternate spelling, different script, stylistic representation, acronyms, etc.
		Refer to the help page for more details and examples.`;
	const helpIconElement = (
		<OverlayTrigger
			delayShow={50}
			overlay={<Tooltip id="alias-editor-tooltip">{helpText}</Tooltip>}
		>
			<FontAwesomeIcon
				className="fa-sm"
				icon={faQuestionCircle}
			/>
		</OverlayTrigger>
	);

	return (
		<Modal bsSize="large" show={show} onHide={onClose}>
			<Modal.Header>
				<Modal.Title>
					Alias Editor {helpIconElement}
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<div className={noAliasesTextClass}>
					<p className="text-muted">This entity has no aliases</p>
				</div>
				<div>
					{
						aliases.map((alias, rowId) => (
							<AliasRow
								index={rowId}
								// eslint-disable-next-line react/no-array-index-key
								key={rowId}
								languageOptions={languageOptionsForDisplay}
							/>
						)).toArray()
					}
				</div>
				<Row>
					<Col className="text-right" md={3} mdOffset={9}>
						<Button variant="success" onClick={onAddAlias}>
							<FontAwesomeIcon icon={faPlus}/>
							<span>&nbsp;Add alias</span>
						</Button>
					</Col>
				</Row>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="primary" onClick={onClose}>Close</Button>
			</Modal.Footer>
		</Modal>
	);
};
AliasEditor.displayName = 'AliasEditor';
AliasEditor.propTypes = {
	aliases: PropTypes.object.isRequired,
	languageOptions: PropTypes.array.isRequired,
	onAddAlias: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	show: PropTypes.bool
};
AliasEditor.defaultProps = {
	show: false
};

function mapDispatchToProps(dispatch) {
	return {
		onAddAlias: () => dispatch(addAliasRow()),
		onClose: () => {
			dispatch(hideAliasEditor());
			dispatch(removeEmptyAliases());
		}
	};
}

function mapStateToProps(rootState) {
	return {
		aliases: rootState.get('aliasEditor')
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AliasEditor);
