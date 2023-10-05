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
import {Card, Table} from 'react-bootstrap';
import {ENTITY_TYPES} from '../../helpers/entity';
import React from 'react';
import {snakeCase} from 'lodash';


function RelationshipTypeMatrixPage() {
	return (
		<Card>
			<Card.Header as="h2">
				Relationship Types
			</Card.Header>
			<Card.Body>
				<Table bordered responsive>
					<thead>
						<tr>
							<th/>
							{ENTITY_TYPES.map((entity1) => <th key={entity1}>{entity1}</th>)}
						</tr>
					</thead>
					<tbody>
						{ENTITY_TYPES.map((entity2, index2) => (
							<tr key={entity2}>
								<td><strong>{entity2}</strong></td>
								{ENTITY_TYPES.map((entity1, index1) => (
									<td key={`${entity1}-${entity2}`}>
										{
											index1 <= index2 ?
												<a href={`/relationship-types/${snakeCase(entity1)}-${snakeCase(entity2)}`}>
													{`${entity1}-${entity2}`}
												</a> : ''
										}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</Table>
			</Card.Body>
		</Card>
	);
}

RelationshipTypeMatrixPage.displayName = 'RelationshipTypeMatrixPage';

export default RelationshipTypeMatrixPage;
