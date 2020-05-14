# THIS A SAMPLE Makefile TO BUILD JSLIB
#
PREFIX = .
SRC_DIR = ${PREFIX}/src
TEST_DIR = ${PREFIX}/test
BUILD_DIR = ${PREFIX}/build
DIST_DIR = ${PREFIX}/dist
DEP_DIR = ${PREFIX}/dep
BIN_DIR = ${PREFIX}/bin
SCRIPT_DIR = ${DIST_DIR}/script
ASSETS_DIR = ${DIST_DIR}/assets


MODULE_NAME = jslib
MODULE_JS = jslib.js
MODULE_MIN_JS = jslib.min.js
MODULE = ${DIST_DIR}/script/${MODULE_JS}
MODULE_MIN = ${DIST_DIR}/script/${MODULE_MIN_JS}
MODULE_VER = `cat VERSION`

PLUGINS = $(shell ls -p ${SRC_DIR} | grep / | xargs)
PLUGINS_JS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.js" 2> /dev/null),"")
PLUGINS_CSS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.css" 2> /dev/null),"")

JS_MODULES = ${SRC_DIR}/header.txt\
	${SRC_DIR}/begin.js\
	${PLUGINS_JS}\
	${SRC_DIR}/error.js\
	${SRC_DIR}/end.js

JS_ENGINE = `which node`
JS_LINT = ${JS_ENGINE} $(BIN_DIR)/jslint-check.js
JS_MINIFIER = ${JS_ENGINE} ${BIN_DIR}/uglify.js --extra
CSS_MINIFIER = java -Xmx96m -jar ${BIN_DIR}/yuicompressor.jar

VER = sed s/@VERSION/${MODULE_VER}/
DATE=`git log --pretty=format:'%ad' -1`

all: clean lint min
	@@echo ${PLUGIN_JS}
	@@echo "all built successfully!"

init: ${JS_MODULES}
	@@mkdir -p ${BUILD_DIR}
	@@mkdir -p ${DIST_DIR}
	@@mkdir -p ${SCRIPT_DIR}
	@@mkdir -p ${ASSETS_DIR}
	@@chmod -R 777 ${PREFIX}/
	@@cp -R ${SRC_DIR}/* ${BUILD_DIR}/
	@@echo "building "${MODULE_NAME}" ..."
	@@echo "Enabled plugins: " $(if ${PLUGINS},"${PLUGINS:%/=%}", "None")
	@@cat ${JS_MODULES} | sed 's/@DATE/'"${DATE}"'/' | ${VER} > ${MODULE};
	@@echo ${MODULE_NAME}" built successfully"

lint: init
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "Checking against JSLint... "; \
		${JS_LINT}; \
	else \
		echo "You must have NodeJS installed to test "${MODULE_JS}" against JSLint."; \
	fi

min: init
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "Minifying "${MODULE_NAME}" ..."; \
		head -18 ${MODULE} > ${MODULE_MIN}; \
		${JS_MINIFIER} ${MODULE} > ${MODULE_MIN}.tmp; \
		sed '$ s#^\( \*/\)\(.\+\)#\1\n\2;#' ${MODULE_MIN}.tmp > ${MODULE_MIN}; \
		rm -rf $(MODULE_MIN).tmp; \
		echo "Success!"; \
	else \
		echo "You must have NodeJS installed to minify "${MODULE_JS}; \
	fi

.PHONY: clean update

update:
	@@echo "------ update "${MODULE_NAME}" ------"
	@@echo "copying " ${DEP_DIR}/prequisite.js "to" ${SCRIPT_DIR}
	@@cp ${DEP_DIR}/prequisite.js ${SCRIPT_DIR}
	@@cp ${DEP_DIR}/prequisite.min.js ${SCRIPT_DIR}
	@@echo "copying " ${TEST_DIR}/test-layers.html "to" ${DIST_DIR}
	@@cp ${TEST_DIR}/test-layers.html ${DIST_DIR}
	@@echo "copying " ${TEST_DIR}/test-layers.js "to" ${SCRIPT_DIR}
	@@cp ${TEST_DIR}/test-layers.js ${SCRIPT_DIR}
	@@echo "copying " ${TEST_DIR}/res/* "to" ${ASSETS_DIR}
	@@cp -R ${TEST_DIR}/res/* ${ASSETS_DIR}

clean:
	@@echo "clean: removing directories: " ${BUILD_DIR} ${DIST_DIR}
	@@rm -rf ${BUILD_DIR}
	@@rm -rf ${DIST_DIR}
