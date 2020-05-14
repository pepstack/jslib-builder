# THIS IS A SAMPLE PROJECT To BUILD JSLIB FOR WEBAPP
# ALL RIGHTS RESERVED BY 350137278@qq.com
# LAST UPDATED: 2014-09-30
MODULE_NAME = jslib

PREFIX = .

# build tools dir
BIN_DIR = ${PREFIX}/.bin
DEP_DIR = ${PREFIX}/.dep

# source dirs
SRC_DIR = ${PREFIX}/src
TEST_DIR = ${PREFIX}/test
ASSETS_DIR = ${PREFIX}/assets

# intermediate dirs
BUILD_DIR = ${PREFIX}/build
DIST_DIR = ${PREFIX}/dist
DIST_SCRIPT = ${DIST_DIR}/script
DIST_ASSETS = ${DIST_DIR}/assets
DIST_CSSDIR = ${DIST_DIR}/css

# plugins
PLUGINS = $(shell ls -p ${SRC_DIR} | grep / | xargs)
PLUGINS_JS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.js" 2> /dev/null),"")
PLUGINS_CSS = $(if ${PLUGINS},$(shell find ${PLUGINS:%=${SRC_DIR}/%/} -name "*.css" 2> /dev/null),"")

# specify export files in module js
JS_MODULES = ${SRC_DIR}/header.txt\
	${SRC_DIR}/begin.js\
	${SRC_DIR}/error.js\
	${PLUGINS_JS}\
	${SRC_DIR}/end.js

CSS_MODULES = ${SRC_DIR}/header.txt\
	${PLUGINS_CSS}

# module files
MODULE_JS = ${MODULE_NAME}.js
MODULE_MIN_JS = ${MODULE_NAME}.min.js

MODULE = ${DIST_DIR}/script/${MODULE_JS}
MODULE_MIN = ${DIST_DIR}/script/${MODULE_MIN_JS}

MODULE_CSS = ${DIST_DIR}/css/${MODULE_NAME}.css
MODULE_CSS_MIN = ${DIST_DIR}/css/${MODULE_NAME}.min.css

MODULE_VER = `cat version.txt`


JS_ENGINE = `which node`
JS_LINT = ${JS_ENGINE} $(PREFIX)/jslint-check.js
JS_MINIFIER = ${JS_ENGINE} ${BIN_DIR}/UglifyJS/bin/uglifyjs
CSS_MINIFIER = java -Xmx96m -jar ${BIN_DIR}/yuicompressor.jar

VER = sed s/@VERSION/${MODULE_VER}/
DATE=`git log --pretty=format:'%ad' -1`


all: clean lint update
	@@echo ${PLUGIN_JS}
	@@echo "[info] all built success."


${DIST_DIR}:
	@@mkdir -p $@
	@@mkdir -p ${DIST_SCRIPT}/tmp
	@@mkdir -p ${DIST_ASSETS}
	@@mkdir -p ${DIST_CSSDIR}


${BUILD_DIR}:
	@@mkdir -p $@


init: ${DIST_DIR} ${JS_MODULES}
	@@cp -r ${SRC_DIR} ${BUILD_DIR}
	@@echo "[info] Building "${MODULE_NAME}" ..."
	@@echo "[info] Enabled plugins: " $(if ${PLUGINS},"${PLUGINS:%/=%}", "None")
	@@cat ${JS_MODULES} | sed 's/@DATE/'"${DATE}"'/' | ${VER} > ${MODULE};
	@@echo "[info] "${MODULE_NAME}" built successfully"


lint: init
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "[info] Checking against JSLint... "; \
		${JS_LINT}; \
	else \
		echo "[error] You must have NodeJS installed to test "${MODULE_JS}" against JSLint."; \
	fi


css: init ${CSS_MODULES}
	@@echo -n "Building CSS... "
	@@cat ${CSS_MODULES} | \
		sed 's/Date:./&'"${DATE}"'/' | ${VER} > ${MODULE_CSS};
	@@echo "Success!"


min: init css
	@@if test ! -z ${JS_ENGINE}; then \
		echo -n "[info] Minifying "${MODULE_NAME}" ..."; \
		head -18 ${MODULE} > ${MODULE_MIN}; \
		${JS_MINIFIER} ${MODULE} > ${MODULE_MIN}.tmp; \
		sed '$ s#^\( \*/\)\(.\+\)#\1\n\2;#' ${MODULE_MIN}.tmp > ${MODULE_MIN}; \
		rm -rf $(MODULE_MIN).tmp; \
		echo "[info] Success!"; \
	else \
		echo "[error] You must have NodeJS installed to minify "${MODULE_JS}; \
	fi
	@@echo -n "[info] Minifying CSS... "
	@@${CSS_MINIFIER} ${MODULE_CSS} --type css -o ${MODULE_CSS_MIN}
	@@echo "[info] Success!"


jscompress:
	@@cp ${DEP_DIR}/prerequisite.js ${DIST_SCRIPT}/tmp
	@@cp ${DEP_DIR}/encode.js ${DIST_SCRIPT}/tmp
	@@cp ${DEP_DIR}/security.js ${DIST_SCRIPT}/tmp
	@@cp ${DIST_SCRIPT}/${MODULE_NAME}.js ${DIST_SCRIPT}/tmp
	@@ant


update: min jscompress
	@@echo "[info] Update success!"


clean:
	@@echo "[info] Removing directories: " ${BUILD_DIR} ${DIST_DIR}
	@@rm -rf ${BUILD_DIR}
	@@rm -rf ${DIST_DIR}

.PHONY: clean update