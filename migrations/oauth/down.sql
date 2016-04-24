ALTER TABLE bookbrainz.editor
	DROP CONSTRAINT password_or_metabrainz_account_check;
ALTER TABLE bookbrainz.editor
	DROP COLUMN metabrainz_user_id;
ALTER TABLE bookbrainz.editor
	ADD COLUMN email VARCHAR(255) CHECK (email <> '');
