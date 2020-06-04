#!/bin/bash

pushd /home/bookbrainz/bookbrainz-site
exec node ./lib/server/app.js
popd