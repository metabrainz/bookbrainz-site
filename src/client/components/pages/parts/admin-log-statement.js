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

import PropTypes from 'prop-types';
import React from 'react';
import {constructAdminLogStatement} from '../../../helpers/adminLogs';


function AdminLogStatement({logData}) {
	const {note} = logData;
	return (
		<>
			{constructAdminLogStatement(logData)}
			{
				note.length ?
					<div className="small">
						<strong>Note/Reason:&nbsp;</strong>{note}
					</div> : null
			}
		</>
	);
}

AdminLogStatement.propTypes = {
	logData: PropTypes.object.isRequired
};

AdminLogStatement.displayName = 'AdminLogStatement';

export default AdminLogStatement;
