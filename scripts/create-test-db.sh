#!/bin/bash

psql -c 'CREATE DATABASE bookbrainz_test;' -U postgres -h localhost
psql -c 'CREATE EXTENSION "uuid-ossp"; CREATE SCHEMA musicbrainz; CREATE SCHEMA bookbrainz;' -d bookbrainz_test -U postgres -h localhost
psql -f sql/schemas/musicbrainz.sql -d bookbrainz_test -U postgres -h localhost
psql -f sql/schemas/bookbrainz.sql -d bookbrainz_test -U postgres -h localhost
psql -f sql/scripts/create_triggers.sql -d bookbrainz_test -U postgres -h localhost
