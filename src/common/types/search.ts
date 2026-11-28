import type {EntityTypeString} from 'bookbrainz-data/lib/types/entity';


type SearchResultFields = {
	aliasSet?: {aliases?: Array<{id: number, name: string}>},
	authors?: string[],
	defaultAlias?: {id?: number, name: string},
	disambiguation?: {comment: string}
};

// What the search index holds: entities have a bbid, editors, collections and areas an id
export type EntitySearchResult = SearchResultFields & {bbid: string, type: EntityTypeString};
export type EditorSearchResult = SearchResultFields & {id: number, name?: string, privs: number, type: 'Editor'};
export type SearchResult = EntitySearchResult | EditorSearchResult | SearchResultFields & {id: number | string, type: 'Area' | 'Collection'};
