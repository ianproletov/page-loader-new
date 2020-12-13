start:
	npx babel-node src/bin/page-loader.js
test:
	npm test
install:
	npm install
publish:
	npm publish --dry-run
lint:
	npm lint .
