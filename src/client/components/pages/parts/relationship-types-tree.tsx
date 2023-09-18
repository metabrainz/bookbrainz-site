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
import {orderBy as _orderBy} from 'lodash';
import {genEntityIconHTMLElement} from '../../../helpers/entity';


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
	}, []);

	let filteredRelationshipTypes = relationshipTypes.filter((relType) => relType.parentId === parentId);
	filteredRelationshipTypes = _orderBy(filteredRelationshipTypes, ['childOrder', 'id']);

	return (
		<ul>
			{filteredRelationshipTypes.map(relType => {
				let relOuterClass = `margin-left-d${indentLevel * 10}`;
				if (relType.deprecated) {
					relOuterClass = `margin-left-d${indentLevel * 10} text-muted`;
				}
				const sourceIconElement = genEntityIconHTMLElement(relType.sourceEntityType);
				const targetIconElement = genEntityIconHTMLElement(relType.targetEntityType);
				return (
					<li className={relOuterClass} key={relType.id}>
						<p>
							<strong>{relType.label}:&nbsp;</strong>
							{sourceIconElement}{relType.sourceEntityType}&nbsp;
							<strong>{relType.linkPhrase}</strong>&nbsp;{targetIconElement}&nbsp;{relType.targetEntityType}
							<Button
								className="btn btn-sm margin-left-d10"
								value={relType.id}
								variant="link"
								onClick={handleClick}
							>
								{expandedRelationshipTypeIds.includes(relType.id) ? '(Less)' : '(More)'}
							</Button>
							<p>
								<small>{relType.description}</small>
							</p>
						</p>
						{expandedRelationshipTypeIds.includes(relType.id) && (
							<div className="type-details small">
								<div><strong>Forward link phrase: </strong>{relType.linkPhrase}</div>
								<div><strong>Reverse link phrase: </strong>{relType.reverseLinkPhrase}</div>
								<div><strong>Source Entity Type: </strong>{relType.sourceEntityType}</div>
								<div><strong>Target Entity Type: </strong>{relType.targetEntityType}</div>
								<div><strong>Description: </strong>{relType.description}</div>
								<div><strong>Child Order: </strong>{relType.childOrder}</div>
								<div><strong>Deprecated: </strong>{relType.deprecated ? 'Yes' : 'No'}</div>
								<div>
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
