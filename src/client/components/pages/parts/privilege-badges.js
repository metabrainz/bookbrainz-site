/*
 * Copyright (C) 2023 Shivam Awasthi
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

import {getBadgeVariantFromBit, getPrivilegeBitsArray, getPrivilegeTitleFromBit} from '../../../../common/helpers/privileges-utils';
import {Badge} from 'react-bootstrap';
import PropTypes from 'prop-types';
import React from 'react';


function PrivilegeBadges({privs}) {
	const privBits = getPrivilegeBitsArray(privs);
	const privilegeListComp = privBits.map(bit => (
		<span key={bit}>
			<Badge pill variant={getBadgeVariantFromBit(bit)}>
				{getPrivilegeTitleFromBit(bit)}
			</Badge>
			{' '}
		</span>
	));
	return (
		<div>{privilegeListComp}</div>
	);
}

PrivilegeBadges.displayName = 'PrivilegeBadges';
PrivilegeBadges.propTypes = {
	privs: PropTypes.number.isRequired
};

export default PrivilegeBadges;
