CREATE TABLE user_type (
  user_type_id     SERIAL PRIMARY KEY,
  label            VARCHAR(255) NOT NULL
);

CREATE TABLE user (
  user_id                SERIAL PRIMARY KEY,
  name                   VARCHAR(64) NOT NULL,
  email                  VARCHAR(255) NOT NULL,
  reputation             INTEGER NOT NULL DEFAULT 0,
  bio                    TEXT,
  birth_date             DATE,
  created_at             TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::text, now()),
  active_at              TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::text, now())
  user_type_id           INTEGER NOT NULL,
  gender_id              INTEGER NOT NULL,
  country_id             INTEGER NOT NULL,
  password               TEXT NOT NULL,
  revisions_applied      INTEGER NOT NULL DEFAULT 0,
  revisions_reverted     INTEGER NOT NULL DEFAULT 0,
  total_revisions        INTEGER NOT NULL DEFAULT 0
);

CREATE TYPE lang_proficiency AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'NATIVE');

CREATE TABLE user_language (
  user_id         INTEGER NOT NULL,
  language_id     INTEGER NOT NULL,
  proficiency     lang_proficiency NOT NULL,
  PRIMARY KEY (user_id, language_id)
);

CREATE TABLE message (
  message_id     SERIAL PRIMARY KEY,
  sender_id      INTEGER,
  subject        VARCHAR(255) NOT NULL,
  content        TEXT NOT NULL
);

CREATE TABLE message_receipt (
  message_id       INTEGER,
  recipient_id     INTEGER,
  archived         BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (message_id, recipient_id)
);

CREATE TABLE oauth_client (
  client_id UUID  DEFAULT public.uuid_generate_v4() PRIMARY KEY,
  client_secret UUID NOT NULL DEFAULT public.uuid_generate_v4() UNIQUE,
  is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
  _redirect_uris TEXT NOT NULL DEFAULT '',
  _default_scopes TEXT NOT NULL DEFAULT '',
  owner_id INTEGER NOT NULL
);
