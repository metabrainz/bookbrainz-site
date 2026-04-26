// small demo dataset used by `search-solr.ts` when solr is empty.

export const testAuthors = [
	{
		bbid: 'author-uuid-lovecraft-1',
		id: 'author-uuid-lovecraft-1',
		type: 'author',
		name: 'H. P. Lovecraft',
		aliases: [
			{name: 'H. P. Lovecraft'},
			{name: 'Howard Phillips Lovecraft'},
			{name: 'Лавкрафт'}, // Cyrillic
			{name: 'ラヴクラフト'} // Japanese Katakana
		],
		disambiguation: 'American horror fiction writer',
		identifiers: [
			{value: 'nm0522454'}, // IMDB
			{value: 'Q169566'} // Wikidata
		]
	},
	{
		bbid: 'author-uuid-tolkien-1',
		id: 'author-uuid-tolkien-1',
		type: 'author',
		name: 'J. R. R. Tolkien',
		aliases: [
			{name: 'J. R. R. Tolkien'},
			{name: 'John Ronald Reuel Tolkien'},
			{name: 'J.R.R. Tolkien'},
			{name: 'トールキン'} // Japanese
		],
		disambiguation: 'English writer and philologist',
		identifiers: [
			{value: 'Q892'}, // Wikidata
			{value: 'n79063338'} // VIAF
		]
	},
	{
		bbid: 'author-uuid-murakami-1',
		id: 'author-uuid-murakami-1',
		type: 'author',
		name: '村上 春樹', // Haruki Murakami in Kanji
		aliases: [
			{name: '村上 春樹'},
			{name: 'Haruki Murakami'},
			{name: 'むらかみ はるき'}, // Hiragana
			{name: 'ハルキ・ムラカミ'} // Katakana
		],
		disambiguation: 'Japanese writer',
		identifiers: [
			{value: 'Q132364'} // Wikidata
		]
	},
	{
		bbid: 'author-uuid-austen-1',
		id: 'author-uuid-austen-1',
		type: 'author',
		name: 'Jane Austen',
		aliases: [
			{name: 'Jane Austen'},
			{name: 'Джейн Остин'} // Cyrillic
		],
		disambiguation: 'English novelist',
		identifiers: [
			{value: 'Q36322'} // Wikidata
		]
	},
	{
		bbid: 'author-uuid-asimov-1',
		id: 'author-uuid-asimov-1',
		type: 'author',
		name: 'Isaac Asimov',
		aliases: [
			{name: 'Isaac Asimov'},
			{name: 'Айзек Азимов'}, // Cyrillic
			{name: 'アイザック・アシモフ'} // Japanese
		],
		disambiguation: 'American science fiction writer',
		identifiers: [
			{value: 'Q34981'} // Wikidata
		]
	}
];

export const testWorks = [
	{
		bbid: 'work-uuid-cthulhu-1',
		id: 'work-uuid-cthulhu-1',
		type: 'work',
		name: 'The Call of Cthulhu',
		aliases: [
			{name: 'The Call of Cthulhu'},
			{name: 'Call of Cthulhu'}
		],
		disambiguation: 'short story',
		authors: ['H. P. Lovecraft'], // Denormalized author names
		identifiers: []
	},
	{
		bbid: 'work-uuid-lotr-1',
		id: 'work-uuid-lotr-1',
		type: 'work',
		name: 'The Lord of the Rings',
		aliases: [
			{name: 'The Lord of the Rings'},
			{name: 'Lord of the Rings'},
			{name: 'LOTR'},
			{name: '指輪物語'} // Japanese
		],
		disambiguation: 'fantasy novel',
		authors: ['J. R. R. Tolkien'],
		identifiers: []
	},
	{
		bbid: 'work-uuid-kafka-1',
		id: 'work-uuid-kafka-1',
		type: 'work',
		name: 'Kafka on the Shore',
		aliases: [
			{name: 'Kafka on the Shore'},
			{name: '海辺のカフカ'}, // Japanese original title
			{name: 'Umibe no Kafuka'}
		],
		disambiguation: 'novel',
		authors: ['村上 春樹', 'Haruki Murakami'], // Both Japanese and romanized
		identifiers: []
	},
	{
		bbid: 'work-uuid-pride-1',
		id: 'work-uuid-pride-1',
		type: 'work',
		name: 'Pride and Prejudice',
		aliases: [
			{name: 'Pride and Prejudice'},
			{name: 'Pride & Prejudice'}
		],
		disambiguation: 'novel',
		authors: ['Jane Austen'],
		identifiers: []
	},
	{
		bbid: 'work-uuid-foundation-1',
		id: 'work-uuid-foundation-1',
		type: 'work',
		name: 'Foundation',
		aliases: [
			{name: 'Foundation'},
			{name: 'The Foundation'},
			{name: '基地'} // Chinese
		],
		disambiguation: 'science fiction novel',
		authors: ['Isaac Asimov'],
		identifiers: []
	}
];

export const testEditions = [
	{
		bbid: 'edition-uuid-cthulhu-1',
		id: 'edition-uuid-cthulhu-1',
		type: 'edition',
		name: 'The Call of Cthulhu (1928 Edition)',
		aliases: [
			{name: 'The Call of Cthulhu (1928 Edition)'}
		],
		disambiguation: 'first edition',
		identifiers: [
			{value: '978-0-486-27204-8'} // ISBN
		]
	},
	{
		bbid: 'edition-uuid-lotr-1',
		id: 'edition-uuid-lotr-1',
		type: 'edition',
		name: 'The Lord of the Rings (50th Anniversary Edition)',
		aliases: [
			{name: 'The Lord of the Rings (50th Anniversary Edition)'},
			{name: 'LOTR 50th Anniversary'}
		],
		disambiguation: '2004 edition',
		identifiers: [
			{value: '978-0-618-51765-0'} // ISBN
		]
	},
	{
		bbid: 'edition-uuid-kafka-1',
		id: 'edition-uuid-kafka-1',
		type: 'edition',
		name: 'Kafka on the Shore (Vintage International)',
		aliases: [
			{name: 'Kafka on the Shore (Vintage International)'}
		],
		disambiguation: 'English translation',
		identifiers: [
			{value: '978-1-4000-7927-6'} // ISBN
		]
	}
];

export const testEditionGroups = [
	{
		bbid: 'eg-uuid-lotr-1',
		id: 'eg-uuid-lotr-1',
		type: 'edition_group',
		name: 'The Lord of the Rings',
		aliases: [
			{name: 'The Lord of the Rings'},
			{name: 'LOTR'}
		],
		disambiguation: null,
		identifiers: []
	}
];

export const testPublishers = [
	{
		bbid: 'publisher-uuid-penguin-1',
		id: 'publisher-uuid-penguin-1',
		type: 'publisher',
		name: 'Penguin Books',
		aliases: [
			{name: 'Penguin Books'},
			{name: 'Penguin'}
		],
		disambiguation: 'British publishing house',
		identifiers: []
	},
	{
		bbid: 'publisher-uuid-vintage-1',
		id: 'publisher-uuid-vintage-1',
		type: 'publisher',
		name: 'Vintage Books',
		aliases: [
			{name: 'Vintage Books'},
			{name: 'Vintage'}
		],
		disambiguation: 'American publishing imprint',
		identifiers: []
	}
];

export const testSeries = [
	{
		bbid: 'series-uuid-foundation-1',
		id: 'series-uuid-foundation-1',
		type: 'series',
		name: 'Foundation Series',
		aliases: [
			{name: 'Foundation Series'},
			{name: 'Foundation Trilogy'}
		],
		disambiguation: 'by Isaac Asimov',
		identifiers: []
	}
];

// Combined dataset for bulk indexing
export const allTestEntities = [
	...testAuthors,
	...testWorks,
	...testEditions,
	...testEditionGroups,
	...testPublishers,
	...testSeries
];

// Helper to transform test data to Solr document format
// Mimics getDocumentToIndex() from search.ts
export function transformToSolrDocument(entity: any) {
	return {
		bbid: entity.bbid,
		id: entity.id,
		type: entity.type,
		name: entity.name,
		alias: entity.aliases?.map((a: any) => a.name) || [],
		disambiguation: entity.disambiguation || '',
		identifier: entity.identifiers?.map((i: any) => i.value) || [],
		// For works: add author field
		...(entity.type === 'work' && entity.authors ? {author: entity.authors} : {}),
		// Store complete document as JSON string 
		_store: JSON.stringify(entity)
	};
}

export const solrTestDocuments = allTestEntities.map(transformToSolrDocument);
