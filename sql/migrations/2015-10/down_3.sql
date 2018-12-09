---------------------
-- Rename ID Fields
---------------------

BEGIN;

ALTER TABLE bookbrainz.message_receipt DROP CONSTRAINT message_receipt_pkey;

CREATE UNIQUE INDEX message_receipt_pkey ON bookbrainz.message_receipt (message_id, recipient_id);
ALTER TABLE bookbrainz.message_receipt DROP COLUMN id;

ALTER TABLE bookbrainz.message_receipt ADD PRIMARY KEY USING INDEX message_receipt_pkey;

COMMIT;
