rm -rf ./docs
rm -rf ./web/docs
jsdoc ./ -d ./docs
jsdoc ./web/ ./web/common -d ./web/docs
