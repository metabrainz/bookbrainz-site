#!/usr/bin/env bash

pushd static/js
mkdir -p editor entity import-entity
popd
pushd src/client/controllers
cross-env BABEL_ENV="browser" watchify -t [babelify] \
		../entity-editor/controller.js \
		editor/edit.js \
		editor/achievement.js \
		editor/editor.js \
		entity/entity.js \
		import-entity/import-entity.js \
		deletion.js \
		index.js \
		registrationDetails.js \
		revision.js \
		search.js \
		statistics.js \
		import-entity/recent-imports.js \
		import-entity/discard-import-entity.js \
	-p [ factor-bundle \
		-o ../../../static/js/entity-editor.js \
		-o ../../../static/js/editor/edit.js \
		-o ../../../static/js/editor/achievement.js \
		-o ../../../static/js/editor/editor.js \
		-o ../../../static/js/entity/entity.js \
		-o ../../../static/js/import-entity/import-entity.js \
		-o ../../../static/js/deletion.js \
		-o ../../../static/js/index.js \
		-o ../../../static/js/registrationDetails.js \
		-o ../../../static/js/revision.js \
		-o ../../../static/js/search.js \
		-o ../../../static/js/statistics.js \
		-o ../../../static/js/import-entity/recent-imports.js \
		-o ../../../static/js/import-entity/discard-import-entity.js \
	] -o ../../../static/js/bundle.js -dv
popd
