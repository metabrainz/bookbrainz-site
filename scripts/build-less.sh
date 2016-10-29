#!/usr/bin/env bash

pushd src/client/stylesheets
catw -c 'lessc --include-path=bootstrap -' \
	'style.less' > ../../../static/stylesheets/style.css
popd
