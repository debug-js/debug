
build: index.js components
	@component build --dev

components: component.json
	@component install --dev

debug.js: index.js components
	@component build --standalone debug --out . --name debug

clean:
	rm -fr build components debug.js

.PHONY: clean