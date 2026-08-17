ALTER TABLE bookbrainz.editor
	ALTER COLUMN active_at SET DEFAULT timezone('UTC'::TEXT, now());
