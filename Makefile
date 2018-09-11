# get Makefile directory name: http://stackoverflow.com/a/5982798/376773
THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

# BIN directory
BIN := $(THIS_DIR)/node_modules/.bin

# Path
PATH := node_modules/.bin:$(PATH)
SHELL := /bin/bash

# applications
NODE ?= $(shell which node)
YARN ?= $(shell which yarn)
PKG ?= $(if $(YARN),$(YARN),$(NODE) $(shell which npm))
BROWSERIFY ?= $(NODE) $(BIN)/browserify

all: lint test

browser: dist/debug.js

dist/debug.js: src/*.js
	@mkdir -p dist
	@$(BROWSERIFY) --standalone debug . > dist/debug.js

lint:
	@xo

test-node:
	@istanbul cover node_modules/mocha/bin/_mocha -- test/**.js
	@cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

test-browser:
	@$(MAKE) browser
	@karma start --single-run

test: test-node test-browser

clean:
	rm -rf dist coverage

.PHONY: all browser install clean lint test test-node test-browser
