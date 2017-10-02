#!/usr/bin/env bash

pushd src/client/controllers
watchify -t [babelify] \
		../entity-editor/controller.js \
		editor/edit.js \
		editor/achievement.js \
		editor/editor.js \
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
		-o ../../../static/js/deletion.js \
		-o ../../../static/js/index.js \
		-o ../../../static/js/registrationDetails.js \
		-o ../../../static/js/revision.js \
		-o ../../../static/js/search.js \
	] -o ../../../static/js/bundle.js -dv
popd
