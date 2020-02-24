// @flow

export type _Author = {

};

export type _AuthorType = {

};

export type _Gender = {

};

export type _IdentifierType = {
	id: number,
	label: string,
	validationRegex: string
};

export type _Language = {

};

// Relationship Type Enum values
export const RelationshipTypes = Object.freeze({
	EditionContainsWork: 10,
	NewEditionInEditionGroup: 3,
	PublisherPublishedNewEdition: 4,
	WrittenByAuthor: 8
});

// Relationship Type Enum
export type RelationshipType = $Values<typeof RelationshipTypes>;
