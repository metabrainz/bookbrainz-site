#!/usr/bin/env bash

pushd src/client/controllers
watchify -t [babelify] \
		../../../templates/layout.js \
		../entity-editor/controller.js \
		editor/edit.js \
		entity/creator.js \
		entity/edition.js \
		entity/publication.js \
		entity/publisher.js \
		entity/work.js \
		deletion.js \
		relationship.js \
		search.js \
	-p [ factor-bundle \
		-o ../../../static/js/layout.js \
		-o ../../../static/js/entity-editor.js \
		-o ../../../static/js/editor/edit.js \
		-o ../../../static/js/entity/creator.js \
		-o ../../../static/js/entity/edition.js \
		-o ../../../static/js/entity/publication.js \
		-o ../../../static/js/entity/publisher.js \
		-o ../../../static/js/entity/work.js \
		-o ../../../static/js/deletion.js \
		-o ../../../static/js/relationship.js \
		-o ../../../static/js/search.js \
	] -o ../../../static/js/bundle.js -dv
popd
