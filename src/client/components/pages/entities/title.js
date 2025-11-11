/*
 * Copyright (C) 2017  Ben Ockmore
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

import * as entityHelper from '../../../helpers/entity';
import {Button} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {faPlus} from '@fortawesome/free-solid-svg-icons';


const {
	getEntitySecondaryAliases, getEntityDisambiguation, getEntityLabel
} = entityHelper;

function EntityTitle({entity, handleModalToggle}) {
	const aliases = getEntitySecondaryAliases(entity);
	const disambiguation = getEntityDisambiguation(entity);
	const label = getEntityLabel(entity);
	return (
		<div>
			<h1>
				{label}{disambiguation}
				{handleModalToggle &&
					<Button
						className="float-end"
						variant="success"
						onClick={handleModalToggle}
					>
						<FontAwesomeIcon icon={faPlus}/>
						{'  Add a review'}
					</Button>
				}
			</h1>
			{aliases}
		</div>
	);
}
EntityTitle.displayName = 'EntityTitle';
EntityTitle.propTypes = {
	entity: PropTypes.object.isRequired,
	handleModalToggle: PropTypes.func
};
EntityTitle.defaultProps = {
	handleModalToggle: null
};

export default EntityTitle;
