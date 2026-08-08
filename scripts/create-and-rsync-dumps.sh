#!/usr/bin/env bash

set -e

/home/bookbrainz/bookbrainz-site/scripts/create-dumps.sh
/home/bookbrainz/bookbrainz-site/scripts/rsync-dump-files.sh
