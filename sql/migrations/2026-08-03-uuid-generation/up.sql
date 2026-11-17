ALTER TABLE bookbrainz.entity
	ALTER COLUMN bbid SET DEFAULT gen_random_uuid();

ALTER TABLE bookbrainz.user_collection
	ALTER COLUMN id SET DEFAULT gen_random_uuid();

DROP EXTENSION IF EXISTS "uuid-ossp";
