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
import {Button, Card} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import {RelationshipTypeDataT} from '../forms/type-editor/typeUtils';
import RelationshipTypeTree from './parts/relationship-types-tree';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons';


type Props = {
	heading: string,
	relationshipTypes: RelationshipTypeDataT[]
};

function RelationshipTypesPage({heading, relationshipTypes}: Props) {
	return (
		<Card>
			<Card.Header as="h2">
				{heading}
				<Button className="float-right" href="/relationship-types" variant="link">
					<FontAwesomeIcon icon={faArrowLeft}/> All relationships
				</Button>
			</Card.Header>
			<Card.Body>
				{
					relationshipTypes.length ?
						<RelationshipTypeTree
							relationshipTypes={relationshipTypes}
						/> :
						`No ${heading} found.`
				}
			</Card.Body>
		</Card>
	);
}

export default RelationshipTypesPage;
