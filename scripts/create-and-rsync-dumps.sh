#!/usr/bin/env bash

set -e

/home/bookbrainz/bookbrainz-site/scripts/create-private-dumps.sh
/home/bookbrainz/bookbrainz-site/scripts/create-public-dumps.sh
/home/bookbrainz/bookbrainz-site/scripts/rsync-dump-files.sh
