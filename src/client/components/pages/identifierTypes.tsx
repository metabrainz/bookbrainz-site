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
import {Card, Container, Nav, Tab} from 'react-bootstrap';
import React, {useCallback, useState} from 'react';
import {ENTITY_TYPES} from '../../helpers/entity';
import {IdentifierTypeDataT} from '../forms/type-editor/typeUtils';
import IdentifierTypeTree from './parts/identifier-types-tree';


type Props = {
	identifierTypes: IdentifierTypeDataT[];
};

function IdentifierTypesPage({identifierTypes}: Props) {
	const [activeTab, setActiveTab] = useState<string>(ENTITY_TYPES[0]);
	const handleTabSelect = useCallback((entityType: string) => {
		setActiveTab(entityType);
	}, []);

	const filteredIdentifierTypes = identifierTypes.filter(type => type.entityType === activeTab);

	return (
		<Card>
			<Card.Header as="h2">
				Identifier Types
			</Card.Header>
			<Card.Body>
				<Container>
					<Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
						<Nav className="flex-row mb-3" variant="pills">
							{ENTITY_TYPES.map((entityType) => (
								<Nav.Item key={entityType}>
									<Nav.Link eventKey={entityType}>{entityType}</Nav.Link>
								</Nav.Item>
							))}
						</Nav>
						<Tab.Content>
							<Tab.Pane eventKey={activeTab}>
								<IdentifierTypeTree identifierTypes={filteredIdentifierTypes}/>
							</Tab.Pane>
						</Tab.Content>
					</Tab.Container>
				</Container>
			</Card.Body>
		</Card>
	);
}

export default IdentifierTypesPage;
