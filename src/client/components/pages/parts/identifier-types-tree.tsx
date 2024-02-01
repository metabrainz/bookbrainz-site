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
import {IdentifierTypeDataT} from '../../forms/type-editor/typeUtils';
import {orderBy as _orderBy} from 'lodash';


type IdentifierTypeTreePropsT = {
	identifierTypes: IdentifierTypeDataT[],
	parentId?: number | null,
	indentLevel?: number
};

function IdentifierTypeTree({identifierTypes, parentId, indentLevel}: IdentifierTypeTreePropsT) {
	const [expandedIdentifierTypeIds, setExpandedIdentifierTypeIds] = useState([]);

	function toggleExpand(identifierTypeId) {
		setExpandedIdentifierTypeIds((prevExpandedIds) => {
			if (prevExpandedIds.includes(identifierTypeId)) {
				return prevExpandedIds.filter((id) => id !== identifierTypeId);
			}
			return [...prevExpandedIds, identifierTypeId];
		});
	}

	const handleClick = useCallback((event) => {
		const identifierTypeId = parseInt(event.target.value, 10);
		toggleExpand(identifierTypeId);
	}, []);

	let filteredIdentifierTypes = identifierTypes.filter((idenType) => idenType.parentId === parentId);
	filteredIdentifierTypes = _orderBy(filteredIdentifierTypes, ['childOrder', 'id']);

	return (
		<ul>
			{filteredIdentifierTypes.map(idenType => {
				let idenOuterClass = `margin-left-d${indentLevel * 10}`;
				if (idenType.deprecated) {
					idenOuterClass = `margin-left-d${indentLevel * 10} text-muted`;
				}
				return (
					<li className={idenOuterClass} key={idenType.id}>
						<div>
							<strong>{idenType.label}&nbsp;</strong>
							<Button
								className="btn btn-sm margin-left-d10"
								value={idenType.id}
								variant="link"
								onClick={handleClick}
							>
								{expandedIdentifierTypeIds.includes(idenType.id) ? '(Less)' : '(More)'}
							</Button>
							<div className="small">
								<div className="text-muted">{idenType.displayTemplate}</div>
								<div>{idenType.description}</div>
							</div>
						</div>
						{expandedIdentifierTypeIds.includes(idenType.id) && (
							<div className="type-details small">
								<div><strong>Detection RegEx: </strong>{idenType.detectionRegex}</div>
								<div><strong>Validation RegEx: </strong>{idenType.validationRegex}</div>
								<div><strong>Display Template: </strong>{idenType.displayTemplate}</div>
								<div><strong>Description: </strong>{idenType.description}</div>
								<div><strong>Child Order: </strong>{idenType.childOrder}</div>
								<div><strong>Deprecated: </strong>{idenType.deprecated ? 'Yes' : 'No'}</div>
								<div>
									<Button
										className="btn btn-sm"
										href={`/identifier-type/${idenType.id}/edit`}
										size="sm"
									>
										Edit
									</Button>
								</div>
							</div>
						)}
						<IdentifierTypeTree
							identifierTypes={identifierTypes}
							indentLevel={indentLevel + 1}
							parentId={idenType.id}
						/>
					</li>
				);
			})}
		</ul>
	);
}

IdentifierTypeTree.defaultProps = {
	indentLevel: 0,
	parentId: null
};

export default IdentifierTypeTree;
