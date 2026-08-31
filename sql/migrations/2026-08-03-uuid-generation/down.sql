CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

ALTER TABLE bookbrainz.entity
	ALTER COLUMN bbid SET DEFAULT public.uuid_generate_v4();

ALTER TABLE bookbrainz.user_collection
	ALTER COLUMN id SET DEFAULT public.uuid_generate_v4();
