BEGIN;

CREATE TABLE IF NOT EXISTS bookbrainz.relationship_order (
    id SERIAL,
    rel_id INT REFERENCES bookbrainz.relationship(id),
    position INTEGER DEFAULT NULL,
	PRIMARY KEY(id, rel_id)
);

CREATE TABLE IF NOT EXISTS bookbrainz.relationship_date (
   id SERIAL,
   rel_id INT REFERENCES bookbrainz.relationship(id),
   begin_year SMALLINT,
   begin_month SMALLINT,
   begin_day SMALLINT,
   end_year SMALLINT,
   end_month SMALLINT,
   end_day SMALLINT,
   ended BOOLEAN NOT NULL DEFAULT FALSE,
   PRIMARY KEY(id, rel_id),
   CHECK (
		(
			(
				end_year IS NOT NULL OR
				end_month IS NOT NULL OR
				end_day IS NOT NULL
			) AND ended = TRUE
		) OR (
			(
				end_year IS NULL AND
				end_month IS NULL AND
				end_day IS NULL
			)
		)
	)
);
	
COMMIT;