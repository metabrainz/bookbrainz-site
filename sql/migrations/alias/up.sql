BEGIN;

ALTER TABLE bookbrainz.alias ADD area_id INTEGER;
ALTER TABLE bookbrainz.alias ADD CONSTRAINT alias_area_id_fkey FOREIGN KEY (area_id) REFERENCES musicbrainz.area(id);

COMMIT;