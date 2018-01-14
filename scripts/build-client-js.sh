#!/usr/bin/env bash

pushd src/client/controllers
cross-env BABEL_ENV="browser" browserify -t [babelify] \
		../entity-editor/controller.js \
		editor/edit.js \
		editor/achievement.js \
		editor/editor.js \
		entity/entity.js \
		deletion.js \
		index.js \
		registrationDetails.js \
		revision.js \
		search.js \
	-p [ factor-bundle \
		-o ../../../static/js/entity-editor.js \
		-o ../../../static/js/editor/edit.js \
		-o ../../../static/js/editor/achievement.js \
		-o ../../../static/js/editor/editor.js \
		-o ../../../static/js/entity/entity.js \
		-o ../../../static/js/deletion.js \
		-o ../../../static/js/index.js \
		-o ../../../static/js/registrationDetails.js \
		-o ../../../static/js/revision.js \
		-o ../../../static/js/search.js \
	] | uglifyjs -c -m > ../../../static/js/bundle.js
popd
