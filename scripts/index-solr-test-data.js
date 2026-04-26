/**
 * Quick script to index test data into Solr
 * Run: node scripts/index-solr-test-data.js
 */

const testData = [
	// Authors
	{
		alias: ['H. P. Lovecraft', 'Howard Phillips Lovecraft', 'Лавкрафт', 'ラヴクラフト'],
		bbid: 'author-uuid-lovecraft-1',
		disambiguation: 'American horror fiction writer',
		id: 'author-uuid-lovecraft-1',
		identifier: ['nm0522454', 'Q169566'],
		name: 'H. P. Lovecraft',
		type: 'author'
	},
	{
		alias: ['J. R. R. Tolkien', 'John Ronald Reuel Tolkien', 'J.R.R. Tolkien', 'トールキン'],
		bbid: 'author-uuid-tolkien-1',
		disambiguation: 'English writer and philologist',
		id: 'author-uuid-tolkien-1',
		identifier: ['Q892', 'n79063338'],
		name: 'J. R. R. Tolkien',
		type: 'author'
	},
	{
		alias: ['村上 春樹', 'Haruki Murakami', 'むらかみ はるき', 'ハルキ・ムラカミ'],
		bbid: 'author-uuid-murakami-1',
		disambiguation: 'Japanese writer',
		id: 'author-uuid-murakami-1',
		identifier: ['Q132364'],
		name: '村上 春樹',
		type: 'author'
	},
	{
		alias: ['Jane Austen', 'Джейн Остин'],
		bbid: 'author-uuid-austen-1',
		disambiguation: 'English novelist',
		id: 'author-uuid-austen-1',
		identifier: ['Q36322'],
		name: 'Jane Austen',
		type: 'author'
	},
	{
		alias: ['Isaac Asimov', 'Айзек Азимов', 'アイザック・アシモフ'],
		bbid: 'author-uuid-asimov-1',
		disambiguation: 'American science fiction writer',
		id: 'author-uuid-asimov-1',
		identifier: ['Q34981'],
		name: 'Isaac Asimov',
		type: 'author'
	},
	// Works (enriched with author aliases for multi-language support)
	{
		alias: ['The Call of Cthulhu', 'Call of Cthulhu'],
		author: ['H. P. Lovecraft', 'Howard Phillips Lovecraft', 'Лавкрафт', 'ラヴクラフト'],
		bbid: 'work-uuid-cthulhu-1',
		disambiguation: 'short story',
		id: 'work-uuid-cthulhu-1',
		identifier: [],
		name: 'The Call of Cthulhu',
		type: 'work'
	},
	{
		alias: ['The Lord of the Rings', 'Lord of the Rings', 'LOTR', '指輪物語'],
		author: ['J. R. R. Tolkien', 'John Ronald Reuel Tolkien', 'J.R.R. Tolkien', 'トールキン'],
		bbid: 'work-uuid-lotr-1',
		disambiguation: 'fantasy novel',
		id: 'work-uuid-lotr-1',
		identifier: [],
		name: 'The Lord of the Rings',
		type: 'work'
	},
	{
		alias: ['Kafka on the Shore', '海辺のカフカ', 'Umibe no Kafuka'],
		author: ['村上 春樹', 'Haruki Murakami', 'むらかみ はるき', 'ハルキ・ムラカミ'],
		bbid: 'work-uuid-kafka-1',
		disambiguation: 'novel',
		id: 'work-uuid-kafka-1',
		identifier: [],
		name: 'Kafka on the Shore',
		type: 'work'
	},
	{
		alias: ['Pride and Prejudice', 'Pride & Prejudice'],
		author: ['Jane Austen', 'Джейн Остин'],
		bbid: 'work-uuid-pride-1',
		disambiguation: 'novel',
		id: 'work-uuid-pride-1',
		identifier: [],
		name: 'Pride and Prejudice',
		type: 'work'
	},
	{
		alias: ['Foundation', 'The Foundation', '基地'],
		author: ['Isaac Asimov', 'Айзек Азимов', 'アイザック・アシモフ'],
		bbid: 'work-uuid-foundation-1',
		disambiguation: 'science fiction novel',
		id: 'work-uuid-foundation-1',
		identifier: [],
		name: 'Foundation',
		type: 'work'
	},
	// Editions
	{
		alias: ['The Call of Cthulhu (1928 Edition)'],
		bbid: 'edition-uuid-cthulhu-1',
		disambiguation: 'first edition',
		id: 'edition-uuid-cthulhu-1',
		identifier: ['978-0-486-27204-8'],
		name: 'The Call of Cthulhu (1928 Edition)',
		type: 'edition'
	},
	{
		alias: ['The Lord of the Rings (50th Anniversary Edition)', 'LOTR 50th Anniversary'],
		bbid: 'edition-uuid-lotr-1',
		disambiguation: '2004 edition',
		id: 'edition-uuid-lotr-1',
		identifier: ['978-0-618-51765-0'],
		name: 'The Lord of the Rings (50th Anniversary Edition)',
		type: 'edition'
	},
	{
		alias: ['Kafka on the Shore (Vintage International)'],
		bbid: 'edition-uuid-kafka-1',
		disambiguation: 'English translation',
		id: 'edition-uuid-kafka-1',
		identifier: ['978-1-4000-7927-6'],
		name: 'Kafka on the Shore (Vintage International)',
		type: 'edition'
	},
	// Edition Groups
	{
		alias: ['The Lord of the Rings', 'LOTR'],
		bbid: 'eg-uuid-lotr-1',
		disambiguation: '',
		id: 'eg-uuid-lotr-1',
		identifier: [],
		name: 'The Lord of the Rings',
		type: 'edition_group'
	},
	// Publishers
	{
		alias: ['Penguin Books', 'Penguin'],
		bbid: 'publisher-uuid-penguin-1',
		disambiguation: 'British publishing house',
		id: 'publisher-uuid-penguin-1',
		identifier: [],
		name: 'Penguin Books',
		type: 'publisher'
	},
	{
		alias: ['Vintage Books', 'Vintage'],
		bbid: 'publisher-uuid-vintage-1',
		disambiguation: 'American publishing imprint',
		id: 'publisher-uuid-vintage-1',
		identifier: [],
		name: 'Vintage Books',
		type: 'publisher'
	},
	// Series
	{
		alias: ['Foundation Series', 'Foundation Trilogy'],
		bbid: 'series-uuid-foundation-1',
		disambiguation: 'by Isaac Asimov',
		id: 'series-uuid-foundation-1',
		identifier: [],
		name: 'Foundation Series',
		type: 'series'
	}
];

async function indexData() {
	const SOLR_URL = 'http://localhost:8983/solr/bookbrainz';

	console.log('indexing test data to solr...');
	console.log(`solr url: ${SOLR_URL}`);
	console.log(`documents to index: ${testData.length}`);

	try {
		// First, check if Solr is responsive
		console.log('\nchecking solr connection...');
		try {
			const pingResponse = await fetch(`${SOLR_URL}/admin/ping?wt=json`);
			if (!pingResponse.ok) {
				throw new Error(`Solr ping failed: ${pingResponse.statusText}`);
			}
			console.log('solr is responsive');
		} catch (pingError) {
			console.error(`cannot connect to solr: ${pingError.message}`);
			console.error('   Falling back to docker exec method...');
			// Fallback: try via docker exec
			try {
				const {execSync} = require('child_process');
				execSync('docker exec bookbrainz-solr-mvp curl -sf http://localhost:8983/solr/bookbrainz/admin/ping', {stdio: 'pipe'});
				console.log('solr is responsive (via docker exec)');
			} catch (dockerError) {
				throw new Error('Cannot connect to Solr. Make sure container is running: docker ps');
			}
		}

		// Add documents
		console.log('\nsending documents to solr...');
		const addResponse = await fetch(`${SOLR_URL}/update/json/docs?commit=true&wt=json`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(testData)
		});

		if (!addResponse.ok) {
			const errorText = await addResponse.text();
			throw new Error(`Failed to add documents: ${addResponse.statusText}\n${errorText}`);
		}

		const addResult = await addResponse.json();
		console.log(`documents indexed and committed (qtime: ${addResult.responseHeader.QTime}ms)`);

		// Verify
		console.log('\nverifying indexed documents...');
		const verifyResponse = await fetch(`${SOLR_URL}/select?q=*:*&rows=0&wt=json`);
		const verifyData = await verifyResponse.json();
		const docCount = verifyData.response.numFound;

		console.log(`verification: ${docCount} documents in index`);
		
		if (docCount !== testData.length) {
			console.warn(`warning: expected ${testData.length} documents but found ${docCount}`);
		}

		console.log('\nindexing complete!');
		console.log('\ntry these test queries:');
		console.log(`   curl "${SOLR_URL}/select?q=lovecraft&defType=edismax&wt=json&indent=true"`);
		console.log(`   curl "${SOLR_URL}/select?q=tolkien&fq=type:author&defType=edismax&wt=json&indent=true"`);
		console.log(`   curl "${SOLR_URL}/select?q=foundation&defType=edismax&wt=json&indent=true"`);

	}
	catch (error) {
		console.error('error indexing data:', error.message);
		console.error('\ntroubleshooting:');
		console.error('   1. Check if Solr is running: docker ps');
		console.error('   2. Check Solr logs: docker logs bookbrainz-solr-mvp');
		console.error('   3. Try restarting: bash setup-solr-with-icu.sh');
		process.exit(1);
	}
}

indexData();
