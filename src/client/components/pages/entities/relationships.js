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
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import Relationship from '../../../entity-editor/relationship-editor/relationship';
import {faPlus} from '@fortawesome/free-solid-svg-icons';


const {Button} = bootstrap;
function EntityRelationships({contextEntity, label, relationships, entityUrl, buttonHref}) {
	const actionUrl = buttonHref ?? `${entityUrl}/edit`;
	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h2>{label}s</h2>
				{relationships?.length > 0 &&
				<Button
					className="margin-top-d15"
					href={actionUrl}
					variant="success"
				>
					<FontAwesomeIcon icon={faPlus}/>
					{`Add ${label}`}
				</Button>}
			</div>
			{relationships?.length > 0 ? (
				<ul className="list-unstyled">
					{relationships.map((relationship) => (
						<li key={relationship.id}>
							<Relationship
								link
								attributes={relationship.attributeSet?.relationshipAttributes ?? null}
								contextEntity={contextEntity}
								relationshipType={relationship.type}
								showAttributes={Boolean(relationship.attributeSetId)}
								sourceEntity={relationship.source}
								targetEntity={relationship.target}
							/>
						</li>
					))}
				</ul>
			) : (
				<p className="text-muted">
					<b>No {label}.</b> <a href={`${entityUrl}/edit`}>Click here to edit</a> and create new {label}.
				</p>
			)}
		</div>
	);
}

EntityRelationships.displayName = 'EntityRelationships';
EntityRelationships.propTypes = {
	buttonHref: PropTypes.string,
	contextEntity: PropTypes.object.isRequired,
	entityUrl: PropTypes.string.isRequired,
	label: PropTypes.string,
	relationships: PropTypes.array.isRequired
};

EntityRelationships.defaultProps = {
	buttonHref: null,
	label: ''
};

export default EntityRelationships;
