#!/bin/sh

set -e

cmd="$@"

until pg_isready -h postgres; do
  >&2 echo "Postgres is not ready - sleeping..."
  sleep 2
done

>&2 echo "Postgres is accepting connections - executing command"
exec $cmd