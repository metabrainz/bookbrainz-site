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

function getChangedAttributeTypes(oldAttributes, newAttributes) {
	const commonAttributes = oldAttributes.filter(value => newAttributes.includes(value));
	const attributesToBeRemoved = oldAttributes.filter(value => !commonAttributes.includes(value));
	const attributesToBeAdded = newAttributes.filter(value => !commonAttributes.includes(value));

	return {attributesToBeAdded, attributesToBeRemoved};
}

/**
 * A handler for create or edit actions on relationship types.
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {object} next - next object
 * @returns {promise} res.send promise
 * @description
 * Creates a new reationship type or updates an existing relationship type
 */
export async function relationshipTypeCreateOrEditHandler(req, res, next) {
	try {
		const {RelationshipType, RelationshipTypeAttributeType, bookshelf} = req.app.locals.orm;
		const trx = await bookshelf.transaction();
		let newRelationshipType;
		let method;
		if (!req.params.id) {
			newRelationshipType = await RelationshipType.forge();
			method = 'insert';
		}
		else {
			newRelationshipType = await RelationshipType.forge({id: parseInt(req.params.id, 10)}).fetch({
				require: true
			});
			method = 'update';
		}
		const {
			attributeTypes,
			childOrder,
			deprecated,
			description,
			label,
			linkPhrase,
			oldAttributeTypes,
			parentId,
			reverseLinkPhrase,
			sourceEntityType,
			targetEntityType
		} = req.body;


		newRelationshipType.set('description', description);
		newRelationshipType.set('label', label);
		newRelationshipType.set('deprecated', deprecated);
		newRelationshipType.set('linkPhrase', linkPhrase);
		newRelationshipType.set('reverseLinkPhrase', reverseLinkPhrase);
		newRelationshipType.set('childOrder', childOrder);
		newRelationshipType.set('parentId', parentId);
		newRelationshipType.set('sourceEntityType', sourceEntityType);
		newRelationshipType.set('targetEntityType', targetEntityType);

		const relationshipType = await newRelationshipType.save(null, {method}, {transacting: trx});
		// Attributes
		const {attributesToBeAdded, attributesToBeRemoved} = getChangedAttributeTypes(oldAttributeTypes, attributeTypes);

		const attributesToBeRemovedPromises = attributesToBeRemoved.map(async attributeID => {
			await new RelationshipTypeAttributeType()
				.query((qb) => {
					qb.where('relationship_type', newRelationshipType.id);
					qb.where('attribute_type', attributeID);
				}).destroy({transacting: trx});
		});
		await Promise.all(attributesToBeRemovedPromises);

		const attributesToBeAddedPromises = attributesToBeAdded.map(async attributeID => {
			const newRelTypeAttrType = await new RelationshipTypeAttributeType();
			newRelTypeAttrType.set('relationshipType', relationshipType.id);
			newRelTypeAttrType.set('attributeType', attributeID);

			await newRelTypeAttrType.save(null, {method: 'insert'}, {transacting: trx});
		});
		await Promise.all(attributesToBeAddedPromises);

		await trx.commit();

		return res.send(relationshipType.toJSON());
	}
	catch (err) {
		return next(err);
	}
}
