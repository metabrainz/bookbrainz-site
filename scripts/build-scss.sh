#!/usr/bin/env bash


# specify paths for production
if [ "$DEPLOY_ENV" == "prod" ] || [ "$DEPLOY_ENV" == "test" ]; then
   node /home/bookbrainz/bookbrainz-site/node_modules/.bin/sass -I /home/bookbrainz/bookbrainz-site/node_modules ./src/client/stylesheets/style.scss > /home/bookbrainz/bookbrainz-site/static/stylesheets/style.css
   exit 0
fi

mkdir -p static/stylesheets
sass -I node_modules src/client/stylesheets/style.scss > static/stylesheets/style.css
