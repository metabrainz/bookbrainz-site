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

export interface AttributeTypeDataT {
	childOrder: number,
	description: string | null,
	id: number,
	lastUpdated: Date,
	name: string,
	parent: number | null,
	root: number
}
