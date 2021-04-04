import * as commonUtils from '../../common/helpers/utils';
import * as request from 'superagent';
import _ from 'lodash';
import log from 'log';


interface BaseDocument {
	id: string;
	name: string[];
}

/* eslint-disable camelcase */
interface EditorDocument extends BaseDocument {
	type: 'Editor';
	editor_active_at: Date;
	editor_created_at: Date;
	editor_total_revisions: number;
}

interface EntityDocument extends BaseDocument {
	disambiguation: string;
}

interface AuthorDocument extends EntityDocument {
	type: 'Author';
	author_begin_area: string;
	author_gender: string;
	author_type: string;
	author_begin_date: string;
	author_end_date: string;
	author_ended: boolean;
}

interface EditionDocument extends EntityDocument {
	type: 'Edition';
	edition_author_credits: string[];
	edition_publishers: string[];
	edition_original_release_year: string[];
	edition_width: number;
	edition_height: number;
	edition_depth: number;
	edition_weight: number;
	edition_pages: number;
	edition_identifiers: string[];
}

interface WorkDocument extends EntityDocument {
	type: 'Work';
	work_type: string;
	work_languages: string[];
}

interface EditionGroupDocument extends EntityDocument {
	type: 'EditionGroup';
	edition_group_type: string;
}

interface PublisherDocument extends EntityDocument {
	type: 'Publisher';
	publisher_type: string;
	publisher_area: string;
	publisher_begin_date: string;
	publisher_end_date: string;
	publisher_ended: boolean;
}

interface AreaDocument extends EntityDocument {
	type: 'Area';
	area_type: string;
}

interface CollectionDocument extends BaseDocument {
	type: 'Collection';
	collection_description: string;
	collection_owner: string;
	collection_entity_type: string;
	collection_last_modified: string;
	collection_created_at: string;
}
/* eslint-enable camelcase */

type Document =
	EditorDocument |
	AuthorDocument |
	EditionDocument |
	WorkDocument |
	EditionGroupDocument |
	PublisherDocument |
	CollectionDocument |
	AreaDocument;

type Result = Document & {_version_: number};

function mapEditorToDocument(editor): EditorDocument {
	/* eslint-disable camelcase */
	return {
		editor_active_at: editor.activeAt,
		editor_created_at: editor.createdAt,
		editor_total_revisions: editor.totalRevisions,
		id: editor.id.toString(),
		name: editor.name,
		type: 'Editor'
	};
	/* eslint-enable camelcase */
}

function mapAuthorToDocument(author): AuthorDocument {
	console.log(author.bbid);
	if (author.bbid === '153dc6d7-0328-4699-a054-18fb3e917e86') {
		console.log(JSON.stringify(author, null, 2));
	}
	/* eslint-disable camelcase */
	return {
		author_begin_area: _.get(author, 'beginArea.name'),
		author_begin_date: author.beginDate,
		author_end_date: author.endDate,
		author_ended: author.ended,
		author_gender: _.get(author, 'gender.name'),
		author_type: _.get(author, 'authorType.label'),
		disambiguation: _.get(author, 'disambiguation.comment'),
		id: author.bbid,
		name: author.aliasSet.aliases.map((x) => x.name),
		type: 'Author'
	};
	/* eslint-enable camelcase */
}

function mapWorkToDocument(work): WorkDocument {
	/* eslint-disable camelcase */
	return {
		disambiguation: _.get(work, 'disambiguation.comment'),
		id: work.bbid,
		name: work.aliasSet.aliases.map((x) => x.name),
		type: 'Work',
		work_languages: _.get(work, 'languageSet.languages', []).map((x) => x.name),
		work_type: _.get(work, 'type')
	};
	/* eslint-enable camelcase */
}

function mapEditionToDocument(edition): EditionDocument {
	/* eslint-disable camelcase */
	return {
		disambiguation: _.get(edition, 'disambiguation.comment'),
		edition_author_credits: _.get(edition, 'authorCredit.names', []).map((x) => x.name),
		edition_depth: _.get(edition, 'depth'),
		edition_height: _.get(edition, 'height'),
		edition_identifiers: _.get(edition, 'identifierSet.identifiers', []).map((x) => x.value),
		edition_original_release_year: _.get(edition, 'releaseEventSet.releaseEvents', []).map((x) => x.date),
		edition_pages: _.get(edition, 'pages'),
		edition_publishers: _.flatten(_.get(edition, 'publisherSet.publishers', []).map((p) => p.aliasSet.aliases.map((x) => x.name))),
		edition_weight: _.get(edition, 'weight'),
		edition_width: _.get(edition, 'width'),
		id: edition.bbid,
		name: edition.aliasSet.aliases.map((x) => x.name),
		type: 'Edition'
	};
	/* eslint-enable camelcase */
}

function mapEditionGroupToDocument(editionGroup): EditionGroupDocument {
	/* eslint-disable camelcase */
	return {
		disambiguation: _.get(editionGroup, 'disambiguation.comment'),
		edition_group_type: _.get(editionGroup, 'type'),
		id: editionGroup.bbid,
		name: editionGroup.aliasSet.aliases.map((x) => x.name),
		type: 'EditionGroup'
	};
	/* eslint-enable camelcase */
}

function mapPublisherToDocument(publisher): PublisherDocument {
	/* eslint-disable camelcase */
	return {
		disambiguation: _.get(publisher, 'disambiguation.comment'),
		id: publisher.bbid,
		name: publisher.aliasSet.aliases.map((x) => x.name),
		publisher_area: _.get(publisher, 'area.name'),
		publisher_begin_date: publisher.beginDate,
		publisher_end_date: publisher.endDate,
		publisher_ended: publisher.ended,
		publisher_type: _.get(publisher, 'type.label'),
		type: 'Publisher'
	};
	/* eslint-enable camelcase */
}

function mapCollectionToDocument(collection): CollectionDocument {
	/* eslint-disable camelcase */
	return {
		collection_created_at: collection.created_at,
		collection_description: collection.description,
		collection_entity_type: collection.entity_type,
		collection_last_modified: collection.last_modified,
		collection_owner: collection.owner.name,
		id: collection.id,
		name: [collection.name],
		type: 'Collection'
	};
	/* eslint-enable camelcase */
}

function mapAreaToDocument(area): AreaDocument {
	/* eslint-disable camelcase */
	return {
		area_type: _.get(area, 'areaType.name'),
		disambiguation: area.comment,
		id: area.gid,
		name: area.name,
		type: 'Area'
	};
	/* eslint-enable camelcase */
}

async function fetchDocuments<T extends BaseDocument>(
	trx: any, Model: any, relations: string[], mappingFunc: (data: any) => T, page: number, pageSize: number,
	queryTransform: (qb: any) => void | null = null
) {
	const query = queryTransform === null ? Model.forge() : Model.forge().query(queryTransform);

	const collection =
		await query.fetchPage({page, pageSize, transacting: trx, withRelated: relations});
	const data = collection.toJSON();

	const docs: T[] = data.map(mappingFunc);
	return docs;
}


async function indexDocuments<T extends BaseDocument>(
	trx: any, Model: any, relations: string[], mappingFunc: (data: any) => T, pageSize: number, searchConfig: SearchConfig,
	queryTransform: (qb: any) => void | null = null
) {
	const collectionName = _.get(searchConfig, 'collectionName', 'bookbrainz');
	const solrURL = `${searchConfig.node}/solr/${collectionName}/update`;

	let data = await fetchDocuments<T>(trx, Model, relations, mappingFunc, 1, pageSize, queryTransform);
	/* eslint-disable no-await-in-loop -- serialize database requests deliberately to avoid execessive requests */
	for (let i = 2; data.length > 0; i++) {
		const indexPromise = request
			.post(solrURL)
			.timeout(searchConfig.requestTimeout)
			.query({commit: true})
			.send(data);
		const nextDataPromise = fetchDocuments<T>(trx, Model, relations, mappingFunc, i, pageSize, queryTransform);
		data = (await Promise.all([nextDataPromise, indexPromise]))[0];
	}
	/* eslint-enable no-await-in-loop */
}

function indexAreas(orm, pageSize: number, searchConfig: SearchConfig) {
	const relations = ['areaType'];

	return orm.bookshelf.transaction(
		(trx) => indexDocuments<AreaDocument>(trx, orm.Area, relations, mapAreaToDocument, pageSize, searchConfig)
	);
}


function indexEditors(orm, pageSize: number, searchConfig: SearchConfig) {
	const relations = [];

	return orm.bookshelf.transaction(
		(trx) => indexDocuments<EditorDocument>(trx, orm.Editor, relations, mapEditorToDocument, pageSize, searchConfig, (qb) => {
			qb.where('type_id', 1);
		})
	);
}

function indexAuthors(orm, pageSize: number, searchConfig: SearchConfig) {
	const relations = [
		'annotation', 'disambiguation', 'aliasSet.aliases',
		'gender', 'authorType', 'beginArea', 'endArea'
	];

	return orm.bookshelf.transaction(
		(trx) => indexDocuments<AuthorDocument>(trx, orm.Author, relations, mapAuthorToDocument, pageSize, searchConfig, (qb) => {
			qb.where('master', true);
			qb.whereNotNull('data_id');
		})
	);
}

function indexEditions(orm, pageSize: number, searchConfig: SearchConfig) {
	const relations = [
		'annotation', 'disambiguation', 'aliasSet.aliases',
		'editionFormat', 'editionStatus', 'authorCredit.authors', 'releaseEventSet.releaseEvents',
		'publisherSet.publishers.aliasSet.aliases', 'identifierSet.identifiers'
	];

	return orm.bookshelf.transaction(
		(trx) => indexDocuments<EditionDocument>(trx, orm.Edition, relations, mapEditionToDocument, pageSize, searchConfig, (qb) => {
			qb.where('master', true);
			qb.whereNotNull('data_id');
		})
	);
}

function indexWorks(orm, pageSize: number, searchConfig: SearchConfig) {
	const relations = [
		'annotation', 'disambiguation', 'aliasSet.aliases',
		'workType', 'languageSet.languages'
	];

	return orm.bookshelf.transaction(
		(trx) => indexDocuments<WorkDocument>(trx, orm.Work, relations, mapWorkToDocument, pageSize, searchConfig, (qb) => {
			qb.where('master', true);
			qb.whereNotNull('data_id');
		})
	);
}

function indexEditionGroups(orm, pageSize: number, searchConfig: SearchConfig) {
	const relations = [
		'annotation', 'disambiguation', 'aliasSet.aliases',
		'editionGroupType'
	];

	return orm.bookshelf.transaction(
		(trx) => indexDocuments<EditionGroupDocument>(trx, orm.EditionGroup, relations, mapEditionGroupToDocument, pageSize, searchConfig, (qb) => {
			qb.where('master', true);
			qb.whereNotNull('data_id');
		})
	);
}

function indexPublishers(orm, pageSize: number, searchConfig: SearchConfig) {
	const relations = [
		'annotation', 'disambiguation', 'aliasSet.aliases',
		'publisherType', 'area'
	];

	return orm.bookshelf.transaction(
		(trx) => indexDocuments<PublisherDocument>(trx, orm.Publisher, relations, mapPublisherToDocument, pageSize, searchConfig, (qb) => {
			qb.where('master', true);
			qb.whereNotNull('data_id');
		})
	);
}

function indexCollections(orm, pageSize: number, searchConfig: SearchConfig) {
	const relations = ['owner'];

	return orm.bookshelf.transaction(
		(trx) => indexDocuments<CollectionDocument>(trx, orm.UserCollection, relations, mapCollectionToDocument, pageSize, searchConfig, (qb) => {
			// only show public collections in search
			qb.where('public', true);
		})
	);
}


interface SearchConfig {
	node: string;
	collectionName?: string;
	requestTimeout: number;
}


export async function index(orm, searchConfig: SearchConfig, chunkSize: number) {
	// Sequential - to avoid overloading SOLR with requests
	await indexAreas(orm, chunkSize, searchConfig);
	await indexEditors(orm, chunkSize, searchConfig);
	await indexAuthors(orm, chunkSize, searchConfig);
	await indexCollections(orm, chunkSize, searchConfig);
	await indexEditionGroups(orm, chunkSize, searchConfig);
	await indexEditions(orm, chunkSize, searchConfig);
	await indexPublishers(orm, chunkSize, searchConfig);
	await indexWorks(orm, chunkSize, searchConfig);
}


export function autocomplete(query: string, type, searchConfig: SearchConfig) {
	const typeString = _.isNil(type) ? '' : ` AND type:${type}`;
	const queryString = `name.autocomplete:"${query}"${typeString}`;

	const collectionName = _.get(searchConfig, 'collectionName', 'bookbrainz');
	const solrURL =
		`${searchConfig.node}/solr/${collectionName}/select?q=${queryString}`;

	return request
		.get(encodeURI(solrURL))
		.timeout(searchConfig.requestTimeout)
		.then((res) => res.body);
}



async function _fetchEntityModelsForSOLRResults(orm, results: Result[]) {
	const {Area, Editor, UserCollection} = orm;

	const processedResults = await Promise.all(results.map(async (result) => {
		// Special cases first
		if (result.type === 'Area') {
			const area = await Area.forge({gid: result.id})
				.fetch({withRelated: ['areaType']});

			const areaJSON = area.toJSON();
			const areaParents = await area.parents();
			areaJSON.defaultAlias = {
				name: areaJSON.name
			};
			areaJSON.type = 'Area';
			areaJSON.disambiguation = {
				comment: `${areaJSON.areaType?.name}${areaParents?.length ? ' - ' : ''}${areaParents?.map(parent => parent.name).join(', ')}`
			};
			return areaJSON;
		}
		if (result.type === 'Editor') {
			const editor = await Editor.forge({id: result.id})
				.fetch();

			const editorJSON = editor.toJSON();
			editorJSON.defaultAlias = {
				name: editorJSON.name
			};
			editorJSON.type = 'Editor';
			editorJSON.bbid = result.id;
			return editorJSON;
		}
		if (result.type === 'Collection') {
			const collection = await UserCollection.forge({id: result.id})
				.fetch();

			const collectionJSON = collection.toJSON();
			collectionJSON.defaultAlias = {
				name: collectionJSON.name
			};
			collectionJSON.type = 'Collection';
			collectionJSON.bbid = result.id;
			return collectionJSON;
		}
		// Regular entity
		const model = commonUtils.getEntityModelByType(orm, result.type);
		const entity = await model.forge({bbid: result.id})
			.fetch({require: false, withRelated: ['defaultAlias.language', 'disambiguation', 'aliasSet.aliases']});

		return entity?.toJSON();
	})).catch(err => log.error(err));
	return processedResults;
}

// Returns the results of a search translated to entity objects
function _searchForEntities(orm, solrURL: string, searchConfig: SearchConfig) {
	return request
		.get(encodeURI(solrURL))
		.timeout(searchConfig.requestTimeout)
		.then((res) => res.body.response.docs)
		.then((results) => _fetchEntityModelsForSOLRResults(orm, results))
		.catch(error => log.error(error));
}

//export function searchByName(orm, name, type, size, from) {
export function searchByName(orm, query: string, type, searchConfig: SearchConfig) {
	// dismax, , pf=name.partial^20

	let modifiedType;
	if (type === 'all_entities') {
		modifiedType = ['author', 'edition', 'edition_group', 'work', 'publisher'];
	}
	else {
		modifiedType = [type];
	}

	const typeString = _.isNil(modifiedType) ? '' : `&fq=type:(${modifiedType.join(' OR ')})`;

	const queryString =
		`q=${query}${typeString}` +
		'&defType=edismax&qf=name^6+name.partial^2+disambiguation^2+disambiguation.partial&pf=name.partial^20&mm=80%';

	console.log(queryString);

	const collectionName = _.get(searchConfig, 'collectionName', 'bookbrainz');
	const solrURL =
		`${searchConfig.node}/solr/${collectionName}/select?${queryString}`;

	return _searchForEntities(orm, solrURL, searchConfig);
}
