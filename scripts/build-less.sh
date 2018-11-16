#!/usr/bin/env bash

pushd src/client/stylesheets

# bootstrap is included here rather than in style.less, because it is actually
# referenced by lobes, not by us - therefore it needs to be resolvable when
# lobes is included
lessc --include-path=bootstrap style.less > ../../../static/stylesheets/style.css
popd
