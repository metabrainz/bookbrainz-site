#!/usr/bin/env bash

cd src/client/stylesheets
catw -c 'lessc --include-path=bootstrap -' \
	'style.less' > ../../../static/stylesheets/style.css
