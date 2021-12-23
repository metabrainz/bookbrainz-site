BEGIN;

INSERT INTO bookbrainz.identifier_type ( id, label, description, detection_regex, validation_regex, display_template, entity_type, parent_id, child_order, deprecated ) 
VALUES 
( 30, 'Wikidata ID', 'The ID for the Wikidata page corresponding to a BookBrainz Series.', 'wikidata\.org/wiki/(?:Special:\w*\/)?(Q\d+)', '^Q\d+$', 'Placeholder Template', 'Series', NULL, 0, false),
( 31, 'VIAF', 'The VIAF ID corresponding to a BookBrainz Series', 'viaf\.org/viaf/(\d+)', '^(\d+)$', 'Placeholder Template', 'Series', NULL, 0, false),
( 32, 'MusicBrainz Series ID', 'The ID for the MusicBrainz Series corresponding to a BookBrainz Series.', 'musicbrainz\.org/series/([a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12})', '^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$', 'Placeholder Template', 'Series', NULL, 0, false),
( 33, 'Goodreads Series ID', 'Goodreads series ID that corresponds to a BookBrainz Series', 'goodreads\.com\/series\/(\d+)(?:[-.]\S+)?', '^[1-9]\d*$', 'Placeholder Template', 'Series', NULL, 0, false),
( 34, 'IMDB List ID', 'The ID for a list from IMDB', 'imdb\.com/list/(ls\d+)', '^(ls\d+)$', 'Placeholder Template', 'Series', NULL, 0, false);
  	
COMMIT;
