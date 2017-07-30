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

import * as bootstrap from 'react-bootstrap';

import Icon from 'react-fontawesome';
import React from 'react';

const {Button} = bootstrap;

function EntityRelationships({entityUrl, relationships}) {
	return (
		<div>
			<h2>Relationships</h2>
			{relationships &&
			<ul className="list-unstyled">
				{relationships.map((relationship) =>
					<li
						dangerouslySetInnerHTML={{
							__html: relationship.rendered
						}}
						key={relationship.id}
					/>
				)}
			</ul>
			}
		</div>
	);
}
EntityRelationships.displayName = 'EntityRelationships';
EntityRelationships.propTypes = {
	entityUrl: React.PropTypes.string.isRequired,
	relationships: React.PropTypes.array.isRequired
};

export default EntityRelationships;
