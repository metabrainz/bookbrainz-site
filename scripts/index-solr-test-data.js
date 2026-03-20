#!/usr/bin/env node

/**
 * Quick script to index test data into Solr
 * Run: node scripts/index-solr-test-data.js
 */

const testData = [
	// Authors
	{
		bbid: 'author-uuid-lovecraft-1',
		id: 'author-uuid-lovecraft-1',
		type: 'author',
		name: 'H. P. Lovecraft',
		alias: ['H. P. Lovecraft', 'Howard Phillips Lovecraft', 'Лавкрафт', 'ラヴクラフト'],
		disambiguation: 'American horror fiction writer',
		identifier: ['nm0522454', 'Q169566']
	},
	{
		bbid: 'author-uuid-tolkien-1',
		id: 'author-uuid-tolkien-1',
		type: 'author',
		name: 'J. R. R. Tolkien',
		alias: ['J. R. R. Tolkien', 'John Ronald Reuel Tolkien', 'J.R.R. Tolkien', 'トールキン'],
		disambiguation: 'English writer and philologist',
		identifier: ['Q892', 'n79063338']
	},
	{
		bbid: 'author-uuid-murakami-1',
		id: 'author-uuid-murakami-1',
		type: 'author',
		name: '村上 春樹',
		alias: ['村上 春樹', 'Haruki Murakami', 'むらかみ はるき', 'ハルキ・ムラカミ'],
		disambiguation: 'Japanese writer',
		identifier: ['Q132364']
	},
	{
		bbid: 'author-uuid-austen-1',
		id: 'author-uuid-austen-1',
		type: 'author',
		name: 'Jane Austen',
		alias: ['Jane Austen', 'Джейн Остин'],
		disambiguation: 'English novelist',
		identifier: ['Q36322']
	},
	{
		bbid: 'author-uuid-asimov-1',
		id: 'author-uuid-asimov-1',
		type: 'author',
		name: 'Isaac Asimov',
		alias: ['Isaac Asimov', 'Айзек Азимов', 'アイザック・アシモフ'],
		disambiguation: 'American science fiction writer',
		identifier: ['Q34981']
	},
	// Works (enriched with author aliases for multi-language support)
	{
		bbid: 'work-uuid-cthulhu-1',
		id: 'work-uuid-cthulhu-1',
		type: 'work',
		name: 'The Call of Cthulhu',
		alias: ['The Call of Cthulhu', 'Call of Cthulhu'],
		disambiguation: 'short story',
		author: ['H. P. Lovecraft', 'Howard Phillips Lovecraft', 'Лавкрафт', 'ラヴクラフト'],
		identifier: []
	},
	{
		bbid: 'work-uuid-lotr-1',
		id: 'work-uuid-lotr-1',
		type: 'work',
		name: 'The Lord of the Rings',
		alias: ['The Lord of the Rings', 'Lord of the Rings', 'LOTR', '指輪物語'],
		disambiguation: 'fantasy novel',
		author: ['J. R. R. Tolkien', 'John Ronald Reuel Tolkien', 'J.R.R. Tolkien', 'トールキン'],
		identifier: []
	},
	{
		bbid: 'work-uuid-kafka-1',
		id: 'work-uuid-kafka-1',
		type: 'work',
		name: 'Kafka on the Shore',
		alias: ['Kafka on the Shore', '海辺のカフカ', 'Umibe no Kafuka'],
		disambiguation: 'novel',
		author: ['村上 春樹', 'Haruki Murakami', 'むらかみ はるき', 'ハルキ・ムラカミ'],
		identifier: []
	},
	{
		bbid: 'work-uuid-pride-1',
		id: 'work-uuid-pride-1',
		type: 'work',
		name: 'Pride and Prejudice',
		alias: ['Pride and Prejudice', 'Pride & Prejudice'],
		disambiguation: 'novel',
		author: ['Jane Austen', 'Джейн Остин'],
		identifier: []
	},
	{
		bbid: 'work-uuid-foundation-1',
		id: 'work-uuid-foundation-1',
		type: 'work',
		name: 'Foundation',
		alias: ['Foundation', 'The Foundation', '基地'],
		disambiguation: 'science fiction novel',
		author: ['Isaac Asimov', 'Айзек Азимов', 'アイザック・アシモフ'],
		identifier: []
	},
	// Editions
	{
		bbid: 'edition-uuid-cthulhu-1',
		id: 'edition-uuid-cthulhu-1',
		type: 'edition',
		name: 'The Call of Cthulhu (1928 Edition)',
		alias: ['The Call of Cthulhu (1928 Edition)'],
		disambiguation: 'first edition',
		identifier: ['978-0-486-27204-8']
	},
	{
		bbid: 'edition-uuid-lotr-1',
		id: 'edition-uuid-lotr-1',
		type: 'edition',
		name: 'The Lord of the Rings (50th Anniversary Edition)',
		alias: ['The Lord of the Rings (50th Anniversary Edition)', 'LOTR 50th Anniversary'],
		disambiguation: '2004 edition',
		identifier: ['978-0-618-51765-0']
	},
	{
		bbid: 'edition-uuid-kafka-1',
		id: 'edition-uuid-kafka-1',
		type: 'edition',
		name: 'Kafka on the Shore (Vintage International)',
		alias: ['Kafka on the Shore (Vintage International)'],
		disambiguation: 'English translation',
		identifier: ['978-1-4000-7927-6']
	},
	// Edition Groups
	{
		bbid: 'eg-uuid-lotr-1',
		id: 'eg-uuid-lotr-1',
		type: 'edition_group',
		name: 'The Lord of the Rings',
		alias: ['The Lord of the Rings', 'LOTR'],
		disambiguation: '',
		identifier: []
	},
	// Publishers
	{
		bbid: 'publisher-uuid-penguin-1',
		id: 'publisher-uuid-penguin-1',
		type: 'publisher',
		name: 'Penguin Books',
		alias: ['Penguin Books', 'Penguin'],
		disambiguation: 'British publishing house',
		identifier: []
	},
	{
		bbid: 'publisher-uuid-vintage-1',
		id: 'publisher-uuid-vintage-1',
		type: 'publisher',
		name: 'Vintage Books',
		alias: ['Vintage Books', 'Vintage'],
		disambiguation: 'American publishing imprint',
		identifier: []
	},
	// Series
	{
		bbid: 'series-uuid-foundation-1',
		id: 'series-uuid-foundation-1',
		type: 'series',
		name: 'Foundation Series',
		alias: ['Foundation Series', 'Foundation Trilogy'],
		disambiguation: 'by Isaac Asimov',
		identifier: []
	}
];

async function indexData() {
	const SOLR_URL = 'http://localhost:8983/solr/bookbrainz';

	console.log('🚀 Indexing test data to Solr...');
	console.log(`📍 Solr URL: ${SOLR_URL}`);
	console.log(`📦 Documents to index: ${testData.length}`);

	try {
		// First, check if Solr is responsive
		console.log('\n🔍 Checking Solr connection...');
		try {
			const pingResponse = await fetch(`${SOLR_URL}/admin/ping?wt=json`);
			if (!pingResponse.ok) {
				throw new Error(`Solr ping failed: ${pingResponse.statusText}`);
			}
			console.log('✅ Solr is responsive');
		} catch (pingError) {
			console.error(`⚠️  Cannot connect to Solr: ${pingError.message}`);
			console.error('   Falling back to docker exec method...');
			// Fallback: try via docker exec
			try {
				const {execSync} = require('child_process');
				execSync('docker exec bookbrainz-solr-mvp curl -sf http://localhost:8983/solr/bookbrainz/admin/ping', {stdio: 'pipe'});
				console.log('✅ Solr is responsive (via docker exec)');
			} catch (dockerError) {
				throw new Error('Cannot connect to Solr. Make sure container is running: docker ps');
			}
		}

		// Add documents
		console.log('\n📤 Sending documents to Solr...');
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
		console.log(`✅ Documents indexed and committed (QTime: ${addResult.responseHeader.QTime}ms)`);

		// Verify
		console.log('\n🔍 Verifying indexed documents...');
		const verifyResponse = await fetch(`${SOLR_URL}/select?q=*:*&rows=0&wt=json`);
		const verifyData = await verifyResponse.json();
		const docCount = verifyData.response.numFound;

		console.log(`✅ Verification: ${docCount} documents in index`);
		
		if (docCount !== testData.length) {
			console.warn(`⚠️  Warning: Expected ${testData.length} documents but found ${docCount}`);
		}

		console.log('\n🎉 Indexing complete!');
		console.log('\n📝 Try these test queries:');
		console.log(`   curl "${SOLR_URL}/select?q=lovecraft&defType=edismax&wt=json&indent=true"`);
		console.log(`   curl "${SOLR_URL}/select?q=tolkien&fq=type:author&defType=edismax&wt=json&indent=true"`);
		console.log(`   curl "${SOLR_URL}/select?q=foundation&defType=edismax&wt=json&indent=true"`);

	}
	catch (error) {
		console.error('❌ Error indexing data:', error.message);
		console.error('\n💡 Troubleshooting:');
		console.error('   1. Check if Solr is running: docker ps');
		console.error('   2. Check Solr logs: docker logs bookbrainz-solr-mvp');
		console.error('   3. Try restarting: bash setup-solr-with-icu.sh');
		process.exit(1);
	}
}

indexData();
