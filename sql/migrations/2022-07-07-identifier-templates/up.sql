BEGIN TRANSACTION;
UPDATE bookbrainz.identifier_type
SET display_template =
	CASE
		WHEN id = 1 THEN 'https://musicbrainz.org/release/{value}'
		WHEN id = 2 THEN 'https://musicbrainz.org/artist/{value}'
		WHEN id = 3 THEN 'https://musicbrainz.org/work/{value}'
		WHEN id = 4 THEN 'https://www.wikidata.org/wiki/{value}'
		WHEN id = 5 THEN 'https://www.amazon.com/dp/{value}'
		WHEN id = 6 THEN 'https://openlibrary.org/books/{value}'
		WHEN id = 8 THEN 'https://openlibrary.org/works/{value}'
		WHEN id = 9 THEN 'https://isbnsearch.org/isbn/{value}'
		WHEN id = 10 THEN 'https://isbnsearch.org/isbn/{value}'
		WHEN id = 11 THEN 'https://www.barcodelookup.com/{value}'
		WHEN id = 13 THEN 'http://www.isni.org/{value}'
		WHEN id = 14 THEN 'https://www.librarything.com/work/{value}'
		WHEN id = 15 THEN 'https://www.librarything.com/author/{value}'
		WHEN id = 16 THEN 'https://www.imdb.com/title/{value}'
		WHEN id = 17 THEN 'https://musicbrainz.org/label/{value}'
		WHEN id = 22 THEN 'https://www.archive.org/details/{value}'
		WHEN id = 23 THEN 'https://www.openlibrary.org/authors/{value}'
		WHEN id = 24 THEN 'https://lccn.loc.gov/{value}'
		WHEN id = 25 THEN 'https://www.orcid.org/{value}'
		WHEN id = 26 THEN 'https://www.worldcat.org/oclc/{value}'
		WHEN id = 27 THEN 'https://www.goodreads.com/author/show/{value}'
		WHEN id = 28 THEN 'https://www.goodreads.com/book/show/{value}'
		WHEN id = 32 THEN 'https://musicbrainz.org/series/{value}'
		WHEN id = 33 THEN 'https://www.goodreads.com/series/{value}'
		WHEN id = 34 THEN 'https://www.imdb.com/list/{value}'
		WHEN id in (12, 29, 31) THEN 'https://viaf.org/viaf/{value}'
		WHEN id in (18, 19, 20, 21, 30) THEN 'https://www.wikidata.org/wiki/{value}'
	END
WHERE id IN (1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34);

COMMIT;