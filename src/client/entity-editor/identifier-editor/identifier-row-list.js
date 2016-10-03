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

import IdentifierRow from './identifier-row';
import React from 'react';
import {connect} from 'react-redux';

/** Presentational component, rendering elements for the list of aliases
  * provided in the props.
  *
  * @returns {object} the rendered list of AliasRow components
  */
function IdentifierRowList({
	identifiers,
	typeOptions
}) {
	return (
		<div>
			{
				identifiers.map((identifier, id) =>
					<IdentifierRow
						index={id}
						key={id}
						typeOptions={typeOptions}
					/>
				)
			}
		</div>
	);
}
IdentifierRowList.displayName = 'IdentifierRowList';
IdentifierRowList.propTypes = {
	identifiers: React.PropTypes.object,
	typeOptions: React.PropTypes.array
};

function mapStateToProps(state, {typeOptions}) {
	return {
		identifiers: state.get('identifierEditor')
	};
}

export default connect(mapStateToProps)(IdentifierRowList);
