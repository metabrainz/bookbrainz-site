#!/usr/bin/env bash

if [ $# -ne 4 ]; then
  echo 'Usage: SchemaSpy.sh [username] [password] [database] [host]';
fi

if [ ! -e "schemaSpy.jar" ]; then
  wget http://sourceforge.net/projects/schemaspy/files/latest/download?source=files -O schemaSpy.jar;
fi

if [ ! -e "postgresql-9.4-1202.jdbc41.jar" ]; then
  wget https://jdbc.postgresql.org/download/postgresql-9.4-1202.jdbc41.jar;
fi

java -jar schemaSpy.jar -t pgsql -host $4 -s bookbrainz -db $3 -u $1 -p $2 -o _build -dp postgresql-9.4-1202.jdbc41.jar;
