/*
 * TODO: the search helpers and the Bookshelf models are untyped, so the no-unsafe rules cannot hold here.
 * Replace the disables with proper types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import {isNil, snakeCase} from 'lodash';
import {ENTITY_TYPES} from 'bookbrainz-data/lib/types/entity';
import type {ORM} from 'bookbrainz-data';
import {getNextEnabledAndResultsArray} from '../common/helpers/utils';
import {searchByName} from '../common/helpers/search';


type SearchParams = {from: number, query: string, size: number, type?: string};

export async function getSearchPage(orm: ORM, {from, query, size, type}: SearchParams) {
	let initialResults: unknown[] = [];
	if (query) {
		// Fetch one more result than required to know whether there is a next page
		const {results} = await searchByName(orm, query, snakeCase(type || 'allEntities') as never, size + 1, from);
		initialResults = results.filter((entity: unknown) => !isNil(entity));
	}
	const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(initialResults, size) as {
		newResultsArray: unknown[], nextEnabled: boolean
	};
	return {
		entityTypes: ENTITY_TYPES,
		initialResults: newResultsArray,
		nextEnabled,
		total: newResultsArray.length
	};
}
