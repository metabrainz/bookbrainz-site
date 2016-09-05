ALTER TABLE bookbrainz.editor ADD password CHAR(60) CHECK (password <> '');
/* password/metabrainz account NOT NULL constraint not re-established because
   passwords will be blank */
