#!/usr/bin/env bash

pushd src/client/stylesheets
catw -c 'lessc --include-path=bootstrap -' \
	'style.less' -o ../../../static/stylesheets/style.css -v
popd
