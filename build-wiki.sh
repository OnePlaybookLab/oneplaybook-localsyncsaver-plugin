#!/bin/bash
cd C:/Users/HP/dev/oneplaybook-tw5-plugins/TiddlyWiki5 &&
echo "Building wiki html file. Please wait..." &&
node ./tiddlywiki.js editions/empty --build index &&
echo "index.html built"