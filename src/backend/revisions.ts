/*
 * The Bookshelf models are untyped, so the no-unsafe rules cannot hold in the queries below.
 * To be replaced by proper ORM types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type {EntityType} from 'bookbrainz-data/lib/types/schema';
import type {ORM} from 'bookbrainz-data';


type EntityRevisionModel = ORM['AuthorRevision'] | ORM['EditionGroupRevision'] | ORM['EditionRevision'] |
	ORM['PublisherRevision'] | ORM['SeriesRevision'] | ORM['WorkRevision'];

// Bookshelf accepts `merge` and `remove` but its types do not list them, so the options are kept in a variable.
// Without them rows that share an id would be merged: a revision can change several entities of one type.
const fetchOptions = {merge: false, remove: false, require: false, withRelated: ['data.aliasSet.defaultAlias']};

type RevisionEntity = {
	bbid: string,
	defaultAlias?: unknown,
	parentAlias?: unknown,
	type: EntityType
};

export type Revision = {
	editor: unknown,
	entities: RevisionEntity[],
	revisionId: number,
	[key: string]: unknown
};

/**
 * Fetches the entities affected by a revision, their alias
 * or in case of deleted entities their last know alias.
 * It then attaches the necessary information to each revisions's entities array
 *
 * @param {array} revisions - the array of revisions
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {array} - The modified revisions array
 */
export async function getAssociatedEntityRevisions(revisions: Revision[], orm: ORM) {
	const revisionIDs = revisions.map(({revisionId}) => revisionId);
	const {AuthorRevision, EditionGroupRevision, EditionRevision, Entity, PublisherRevision, SeriesRevision, WorkRevision} = orm;
	const revisionModels: EntityRevisionModel[] = [
		AuthorRevision, EditionGroupRevision, EditionRevision, PublisherRevision, SeriesRevision, WorkRevision
	];
	/* eslint-disable no-await-in-loop */
	for (const EntityRevision of revisionModels) {
		const entityRevisions = await new EntityRevision()
			.query((qb) => {
				qb.whereIn('id', revisionIDs);
			})
			.fetchAll(fetchOptions)
			.catch(EntityRevision.NotFoundError, (err: unknown) => {
				// eslint-disable-next-line no-console
				console.log(err);
			});
		if (entityRevisions?.length) {
			const entityRevisionsJSON = entityRevisions.toJSON() as Array<{
				bbid: string, data?: {aliasSet: {defaultAlias: unknown}}, id: number
			}>;
			for (const entityRevision of entityRevisionsJSON) {
				const entity = await new Entity({bbid: entityRevision.bbid}).fetch();
				const type = entity.get('type') as EntityType;
				const bbid = entity.get('bbid') as string;
				const entityProps: RevisionEntity = {bbid, type};
				if (entityRevision.data) {
					entityProps.defaultAlias = entityRevision.data.aliasSet.defaultAlias;
				}
				// Only a deleted entity has no data: use its last known alias
				else {
					entityProps.parentAlias = await orm.func.entity.getEntityParentAlias(orm, type, bbid);
				}
				const revision = revisions.find((rev) => rev.revisionId === entityRevision.id);
				revision?.entities.push(entityProps);
			}
		}
	}
	/* eslint-enable no-await-in-loop */
	return revisions;
}

/**
 * Fetches revisions for Show All Revisions/Index Page
 * Fetches the last 'size' number of revisions with offset 'from'
 *
 * @param {number} from - the offset value
 * @param {number} size - no. of last revisions required
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {array} - orderedRevisions
 */
export async function getOrderedRevisions(from: number, size: number, orm: ORM) {
	const revisions = await new orm.Revision().orderBy('created_at', 'DESC')
		.fetchPage({
			limit: size,
			offset: from,
			withRelated: ['author']
		});
	const revisionsJSON = revisions.toJSON() as Array<{author: unknown, authorId?: number, id: number}>;

	const formattedRevisions: Revision[] = revisionsJSON.map((rev) => {
		delete rev.authorId;
		const {author: editor, id: revisionId, ...otherProps} = rev;
		return {editor, entities: [], revisionId, ...otherProps};
	});

	return getAssociatedEntityRevisions(formattedRevisions, orm);
}

export async function getRevisionsPage(orm: ORM, {from, size}: {from: number, size: number}) {
	// Fetch one more than required to know whether there is a next page
	const orderedRevisions = await getOrderedRevisions(from, size + 1, orm);
	const limit = Math.max(0, size);
	return {nextEnabled: orderedRevisions.length > limit, results: orderedRevisions.slice(0, limit)};
}
