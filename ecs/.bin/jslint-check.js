/**
 * jslint-check.js
 *
 * MAKE SURE jslint_path IS CORRECT
 * CHANGE js_files FOR CHECKING
 */
var
  jslint_path = "./.bin/lib/jslint",
  js_files = [
    // add your file as below:
    "./.dep/prequisite.js"
    // ,"./dist/script/file01.js"
  ]
;

/**
 * DO NOT CHANGE BELOW CODES
 */
var
  JSLINT = require(jslint_path).JSLINT,
  print = require("util").print,
  index
;

/**
 * All of the following are known issues that we think are 'ok'
 * (in contradiction with JSLint) more information here:
 * http://docs.jquery.com/JQuery_Core_Style_Guidelines
 */
var ok = {
  "Expected an identifier and instead saw 'undefined' (a reserved word).": true,
  "Expected a conditional expression and instead saw an assignment.": true,
  "Expected an identifier and instead saw 'default' (a reserved word).": true,
  "Insecure '.'.": true,
  "Insecure '^'.": true,
  'Missing "use strict" statement.': true
};

var jscheckfile = function (jsFile) {
  print( "\n============================================\n" );
  print( "JSLint start checking: " + jsFile + "\n" );

  var src = require("fs").readFileSync(jsFile, "utf8");

  JSLINT(src, {
      devel: true,
      evil: true,
      forin: true,
      maxerr: 20, 
      undef: true,
      indent: 2,
      plusplus: true,
      vars: true,
      nomen: true
    }
  );

  var e = JSLINT.errors, found = 0, w, j;

  for (j = 0; j < e.length; j++ ) {
    w = e[j];

    if ( !ok[ w.reason ] ) {
      found++;
      print( "\n" + w.evidence + "\n" );
      print( "Problem at line " + w.line + " character " + w.character + ": " + w.reason );
    }
  }

  if (found > 0) {
    print( "\n" + found + " Error(s) found.\n" );      
  }
  else {
    print( "Success!\n" );
  }
}

for (index = 0; index < js_files.length; index++) {
  jscheckfile(js_files[index]);
}

/* end of jslint-check.js */
