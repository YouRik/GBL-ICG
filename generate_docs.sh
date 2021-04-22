rm -rf ./docs
rm -rf ./web/docs
node_modules/.bin/jsdoc ./ -d ./docs
node_modules/.bin/jsdoc ./web/ ./web/common -d ./web/docs
