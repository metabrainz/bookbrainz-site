#!/usr/bin/env bash

pushd src/client/stylesheets

# bootstrap is included here rather than in style.less, because it is actually
# referenced by lobes, not by us - therefore it needs to be resolvable when
# lobes is included
catw -c 'lessc --include-path=bootstrap -' \
	'style.less' -o ../../../static/stylesheets/style.css -v
popd
