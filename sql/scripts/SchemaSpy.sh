#!/usr/bin/env bash

throw_error () {
  echo "Error, Please provide ${1}" >&2
  exit 1
}

if [ ! -e "schemaSpy.jar" ]; then
  wget http://sourceforge.net/projects/schemaspy/files/latest/download?source=files -O schemaSpy.jar;
fi

if [ ! -e "postgresql-9.4-1202.jdbc41.jar" ]; then
  wget https://jdbc.postgresql.org/download/postgresql-9.4-1202.jdbc41.jar;
fi

while getopts "d:h:p:u:" opt; do
  case $opt in
    d)  DATABASE=$OPTARG;;
    h)  HOST=$OPTARG;;
    p)  PASSWORD=$OPTARG;;
    u)  _USERNAME=$OPTARG;;
    *) echo "Error Occurred, Usage: SchemaSpy.sh -u [username] -p [password] -d [database] -h [host]" >&2
       exit 1
  esac
done

CMD="java -jar schemaSpy.jar -t pgsql -s bookbrainz "

if [ ! -z "$HOST" ]
then
  CMD+="-host ${HOST} "
else
  throw_error "host: -h [host]"
fi

if [ ! -z "$DATABASE" ]
then
  CMD+="-db ${DATABASE} "
else
  throw_error "database: -d [database]"
fi

if [ ! -z "$_USERNAME" ]
then
  CMD+="-u ${_USERNAME} "
else
  throw_error "username: -u [username]"
fi

CMD+="-p '${PASSWORD}' "
CMD+="-o _build -dp postgresql-9.4-1202.jdbc41.jar;"

echo $CMD
eval $CMD