#!/usr/bin/env bash

cp -R node_modules/bootstrap/less/ src/client/stylesheets/bootstrap
cp -R node_modules/font-awesome/less/ src/client/stylesheets/font-awesome
cp node_modules/select2/dist/css/select2.min.css static/stylesheets
cp node_modules/select2-bootstrap-theme/dist/select2-bootstrap.min.css static/stylesheets
