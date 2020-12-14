start:
	npx babel-node src/bin/page-loader.js
test:
	npm test
test-coverage:
	npm test -- --coverage
install:
	npm install
publish:
	npm publish --dry-run
build:
	npm run build
lint:
	npx eslint .
