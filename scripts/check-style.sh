node_modules/.bin/eslint --ext .js --ext .jsx src test templates scripts app.js gulpfile.js\
&& node_modules/.bin/jscs -e src test templates scripts app.js gulpfile.js
