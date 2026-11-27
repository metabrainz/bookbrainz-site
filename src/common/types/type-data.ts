import type {EntityTypeString} from 'bookbrainz-data/lib/types/entity';


export interface RelationshipTypeDataT {
	attributeTypes: number[];
	id: number;
	label: string;
	description: string;
	linkPhrase: string;
	reverseLinkPhrase: string;
	deprecated: boolean;
	parentId: number | null;
	childOrder: number;
	sourceEntityType: EntityTypeString;
	targetEntityType: EntityTypeString;
}

// A relationship type fetched without its attribute types
export type RelationshipTypeRowT = Omit<RelationshipTypeDataT, 'attributeTypes'>;

export interface AttributeTypeDataT {
	childOrder: number,
	description: string | null,
	id: number,
	lastUpdated: Date,
	name: string,
	parent: number | null,
	root: number
}
