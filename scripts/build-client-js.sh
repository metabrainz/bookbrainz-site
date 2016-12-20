#!/usr/bin/env bash

pushd src/client/controllers
browserify -t [babelify] \
		../../../templates/layout.js \
		editor/edit.js \
		editor/achievement.js \
		entity/creator.js \
		entity/edition.js \
		entity/publication.js \
		entity/publisher.js \
		entity/work.js \
		deletion.js \
		relationship.js \
		revision.js \
		search.js \
	-p [ factor-bundle \
		-o ../../../static/js/layout.js \
		-o ../../../static/js/editor/edit.js \
		-o ../../../static/js/editor/achievement.js \
		-o ../../../static/js/entity/creator.js \
		-o ../../../static/js/entity/edition.js \
		-o ../../../static/js/entity/publication.js \
		-o ../../../static/js/entity/publisher.js \
		-o ../../../static/js/entity/work.js \
		-o ../../../static/js/deletion.js \
		-o ../../../static/js/relationship.js \
		-o ../../../static/js/revision.js \
		-o ../../../static/js/search.js \
	] > ../../../static/js/bundle.js
popd
