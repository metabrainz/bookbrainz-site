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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React, {useCallback, useState} from 'react';
import {Button} from 'react-bootstrap';
import {RelationshipTypeDataT} from '../../forms/type-editor/typeUtils';


type RelationshipTypeTreePropsT = {
	relationshipTypes: RelationshipTypeDataT[],
	parentId?: number | null,
	indentLevel?: number
};

function RelationshipTypeTree({relationshipTypes, parentId, indentLevel}: RelationshipTypeTreePropsT) {
	const [expandedRelationshipTypeIds, setExpandedRelationshipTypeIds] = useState([]);

	function toggleExpand(relTypeId) {
		setExpandedRelationshipTypeIds((prevExpandedIds) => {
			if (prevExpandedIds.includes(relTypeId)) {
				return prevExpandedIds.filter((id) => id !== relTypeId);
			}
			return [...prevExpandedIds, relTypeId];
		});
	}

	const handleClick = useCallback((event) => {
		const relationshipTypeId = parseInt(event.target.value, 10);
		toggleExpand(relationshipTypeId);
	}, [expandedRelationshipTypeIds]);

	const filteredRelationshipTypes = relationshipTypes.filter((relType) => relType.parentId === parentId);

	return (
		<ul>
			{filteredRelationshipTypes.map(relType => {
				let relOuterClass = `margin-left-d${indentLevel * 20}`;
				if (relType.deprecated) {
					relOuterClass = `margin-left-d${indentLevel * 20} text-muted`;
				}
				return (
					<li className={relOuterClass} key={relType.id}>
						<span >
							<strong>{relType.label}</strong>
							<Button
								value={relType.id}
								variant="link"
								onClick={handleClick}
							>
								{expandedRelationshipTypeIds.includes(relType.id) ? '(Less)' : '(More)'}
							</Button>
						</span>
						{expandedRelationshipTypeIds.includes(relType.id) && (
							<div className={`margin-left-d${(indentLevel + 1) * 20}`}>
								<div className="small"><strong>Forward link phrase: </strong>{relType.linkPhrase}</div>
								<div className="small"><strong>Reverse link phrase: </strong>{relType.reverseLinkPhrase}</div>
								<div className="small"><strong>Source Entity Type: </strong>{relType.sourceEntityType}</div>
								<div className="small"><strong>Target Entity Type: </strong>{relType.targetEntityType}</div>
								<div className="small"><strong>Description: </strong>{relType.description}</div>
								<div className="small"><strong>Child Order: </strong>{relType.childOrder}</div>
								<div className="small"><strong>Deprecated: </strong>{relType.deprecated ? 'Yes' : 'No'}</div>
								<div className="small">
									<Button
										className="btn btn-sm"
										href={`/relationship-type/${relType.id}/edit`}
										size="sm"
									>
										Edit
									</Button>
								</div>
							</div>
						)}
						<RelationshipTypeTree
							indentLevel={indentLevel + 1}
							parentId={relType.id}
							relationshipTypes={relationshipTypes}
						/>
					</li>
				);
			})}
		</ul>
	);
}

RelationshipTypeTree.defaultProps = {
	indentLevel: 0,
	parentId: null
};

export default RelationshipTypeTree;
