#!/usr/bin/env bash

pushd src/client/controllers
cross-env BABEL_ENV="browser" browserify -t [babelify] \
		../entity-editor/controller.js \
		editor/edit.js \
		editor/achievement.js \
		editor/editor.js \
		entity/entity.js \
		error.js \
		deletion.js \
		index.js \
		registrationDetails.js \
		revision.js \
		revisions.js \
		search.js \
		statistics.js \
	-p [ factor-bundle \
		-o ../../../static/js/entity-editor.js \
		-o ../../../static/js/editor/edit.js \
		-o ../../../static/js/editor/achievement.js \
		-o ../../../static/js/editor/editor.js \
		-o ../../../static/js/entity/entity.js \
		-o ../../../static/js/error.js \
		-o ../../../static/js/deletion.js \
		-o ../../../static/js/index.js \
		-o ../../../static/js/registrationDetails.js \
		-o ../../../static/js/revision.js \
		-o ../../../static/js/revisions.js \
		-o ../../../static/js/search.js \
		-o ../../../static/js/statistics.js \
	] > ../../../static/js/bundle.js

	uglifyjs -cm -- ../../../static/js/entity-editor.js  	  | gzip --best > ../../../static/js/entity-editor.js.gz
	uglifyjs -cm -- ../../../static/js/editor/edit.js 	  | gzip --best > ../../../static/js/editor/edit.js.gz
	uglifyjs -cm -- ../../../static/js/editor/achievement.js  | gzip --best > ../../../static/js/editor/achievement.js.gz
	uglifyjs -cm -- ../../../static/js/editor/editor.js 	  | gzip --best > ../../../static/js/editor/editor.js.gz
	uglifyjs -cm -- ../../../static/js/entity/entity.js	  | gzip --best > ../../../static/js/entity/entity.gz
	uglifyjs -cm -- ../../../static/js/error.js	  | gzip --best > ../../../static/js/error.js.gz
	uglifyjs -cm -- ../../../static/js/deletion.js 		  | gzip --best > ../../../static/js/deletion.js.gz
	uglifyjs -cm -- ../../../static/js/index.js 		  | gzip --best > ../../../static/js/index.js.gz
	uglifyjs -cm -- ../../../static/js/registrationDetails.js | gzip --best > ../../../static/js/registrationDetails.js.gz
	uglifyjs -cm -- ../../../static/js/revision.js 		  | gzip --best > ../../../static/js/revision.js.gz
	uglifyjs -cm -- ../../../static/js/revisions.js 		  | gzip --best > ../../../static/js/revisions.js.gz
	uglifyjs -cm -- ../../../static/js/search.js 		  | gzip --best > ../../../static/js/search.js.gz
	uglifyjs -cm -- ../../../static/js/bundle.js     | gzip --best > ../../../static/js/bundle.js.gz
popd
