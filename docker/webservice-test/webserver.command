#!/bin/bash

pushd /home/bookbrainz/bookbrainz-site
exec node ./lib/api/app.js
popd