ALTER TABLE bookbrainz.editor
	DROP COLUMN email;
ALTER TABLE bookbrainz.editor
	ADD COLUMN metabrainz_user_id INTEGER CHECK (metabrainz_user_id >= 0);
ALTER TABLE bookbrainz.editor
	ALTER COLUMN password DROP NOT NULL;
ALTER TABLE bookbrainz.editor
	ADD CONSTRAINT password_or_metabrainz_account_check
	CHECK (
		password IS NOT NULL OR metabrainz_user_id IS NOT NULL
	);
