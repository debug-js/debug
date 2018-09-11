# http://stackoverflow.com/a/5982798/376773
THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)
export PATH := $(THIS_DIR)/node_modules/.bin:$(PATH)
SHELL := /bin/bash

all: lint test

dist: dist/debug.js dist/test.js

.INTERMEDIATE: dist/debug.es6.js
dist/debug.es6.js: src/*.js
	@mkdir -p dist
	browserify --standalone debug . > $@

dist/debug.js: dist/debug.es6.js
	@mkdir -p dist
	babel $< > $@

dist/test.js: test.js
	@mkdir -p dist
	babel $< > $@

lint:
	xo

test-node:
	istanbul cover node_modules/mocha/bin/_mocha -- test.js
	@cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

test-browser: dist
	karma start --single-run

test: test-node test-browser

clean:
	rm -rf dist coverage

.PHONY: all dist clean lint test test-node test-browser
