#!/usr/bin/env bash


# specify paths for production
if [ "$DEPLOY_ENV" == "prod" ] || [ "$DEPLOY_ENV" == "test" ]; then
   /home/bookbrainz/bookbrainz-site/node_modules/less/bin/lessc --include-path=/home/bookbrainz/bookbrainz-site/node_modules/bootstrap/less ./src/client/stylesheets/style.less > /home/bookbrainz/bookbrainz-site/static/stylesheets/style.css
   exit 0
fi

pushd src/client/stylesheets

# bootstrap is included here rather than in style.less, because it is actually
# referenced by lobes, not by us - therefore it needs to be resolvable when
# lobes is included
lessc --include-path=bootstrap style.less > ../../../static/stylesheets/style.css
popd
