#!/usr/bin/env bash

cd src/client/stylesheets
catw -c 'lessc --include-path=bootstrap -' \
	'style.less' -o ../../../static/stylesheets/style.css -v
