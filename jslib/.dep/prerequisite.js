/**
 * prerequisite.js
 *    cheungmine
 * 2012-07-13
 */
(function ($w, undefined) {
    'use strict';

    var Utils = {};

    // set 'DEBUG = false' if released
    var DEBUG = Utils.DEBUG = true;

    var isNull = Utils.isNull = function (v) {
        return (v === null || v === undefined);
    };

    var notNull = Utils.notNull = function (v) {
        return (v !== null && v !== undefined);
    };

    var isEmpty = Utils.isEmpty = function (v) {
        return (v === null || v === undefined || v === "");
    };

    var notEmpty = Utils.notEmpty = function (v) {
        return (v !== null && v !== undefined && v !== "");
    };

    var isTrue = Utils.isTrue = function (v) {
        return (v === true || v === 1);
    };

    var isFalse = Utils.isFalse = function (v) {
        return (v === false || v === 0 || v === "");
    };

    var getElem = Utils.getElem = function (id) {
        return notEmpty(id) ? document.getElementById(id) : null;
    };

    var getType = Utils.getType = function (x) {
        if (x === null) {
            return "(null)";
        }
        var t = typeof x;
        if (t.toLocaleLowerCase() !== "object") {
            return t;
        }
        t = Object.prototype.toString.apply(x).toLowerCase();
        t = t.substring(8, t.length - 1);
        if (t.toLocaleLowerCase() !== "object") {
            return t;
        }
        if (x.constructor === Object) {
            return t;
        }
        if (typeof x.constructor === "function") {
            if (x.toString) {
                t = x.toString();
                if (t.substring(0, 7) === "[class ") {
                    return t.substring(7, t.length - 1).toLocaleLowerCase();
                }
            }
            var reg = /\W*function\s+([\w\$]+)\s*\(/;
            var names = reg.exec(x.constructor);
            if (!names) {
                return '(anonymous)';
            }
            return names[1];
        }
        return "(unknown)";
    };

    var addEvent = Utils.addEvent = function (el, type, fn) {
        var i;
        if (document.addEventListener) {
            if ((el && el.nodeName) || el === $w) {
                el.addEventListener(type, fn, false);
            } else if (el && el.length) {
                for (i = 0; i < el.length; i++) {
                    addEvent(el[i], type, fn);
                }
            }
        } else {
            if ((el && el.nodeName) || el === $w) {
                el.attachEvent('on' + type, function () {
                    return fn.call(el, $w.event);
                });
            } else if (el && el.length) {
                for (i = 0; i < el.length; i++) {
                    addEvent(el[i], type, fn);
                }
            }
        }
    };

    var checkIE = function (agent) {
        var isIE = agent.indexOf('msie') !== -1;
        var isLteIE8 = isIE && !+[1,];
        var dm = document.documentMode, isIE5, isIE6, isIE7, isIE8, isIE9, isIE10, isIE11;
        if (dm) {
            isIE5 = dm === 5;
            isIE6 = dm === 6;
            isIE7 = dm === 7;
            isIE8 = dm === 8;
            isIE9 = dm === 9;
            isIE10 = dm === 10;
            isIE11 = dm === 11;
        } else {
            isIE5 = (isLteIE8 && (!document.compatMode || document.compatMode === 'BackCompat'));
            isIE6 = isLteIE8 && !isIE5 && !window.XMLHttpRequest;
            isIE7 = isLteIE8 && !isIE6 && !document.documentMode;
            isIE8 = isLteIE8 && document.documentMode;
            isIE9 = !isLteIE8 && (function() {
                "use strict";
                return !!this;
            }());
            isIE10 = isIE && !!document.attachEvent && (function() {
                "use strict";
                return !this;
            }());
            isIE11 = isIE && !document.attachEvent;
        }

        return {
            isQuirks: document.compatMode !== 'CSS1Compat',
            isIE : isIE,
            isIE5 : isIE5,
            isIE6 : isIE6,
            isIE7 : isIE7,
            isIE8 : isIE8,
            isIE9 : isIE9,
            isIE10 : isIE10,
            isIE11 : isIE11,
            isLtIE8: (isIE7 || isIE6 || isIE5),
            isLtIE9: (isIE8 || isIE7 || isIE6 || isIE5),
            isLtIE10: (isIE9 || isIE8 || isIE7 || isIE6 || isIE5)
        };
    };

    var getBrowserAgent = Utils.getBrowserAgent = function () {
        var brwr = {};
        var agent = navigator.userAgent.toLowerCase();

        if ($w.ActiveXObject && agent.indexOf('msie') !== -1) {
            brwr.ie = true;
            brwr.ieVer = checkIE(agent);
        } else if (agent.indexOf('firefox') !== -1) {
            brwr.firefox = true;
        } else if (agent.indexOf('opera') !== -1) {
            brwr.opera = true;
        } else if (agent.indexOf('chrome') !== -1) {
            brwr.chrome = true;
        } else {
            var other = true;
            if (agent.indexOf('safari') !== -1) {
                brwr.safari = true;
                other = false;
            }
            if (agent.indexOf('applewebkit') !== -1) {
                brwr.applewebkit = true;
                other = false;
            }
            if (agent.indexOf('chromium') !== -1) {
                brwr.chromium = true;
                other = false;
            }
            if (other) {
                brwr.other = true;
            }
        }
        brwr.agent = agent;
        return brwr;
    };

    var assert = Utils.assert = function (expr, msg, source, lineno) {
        var out = "Assertion Failed";
        if (notNull(msg)) {
            out += ": " + msg;
        }
        out += ".";

        if (notNull(source)) {
            out += " ( " + source;
            if (notNull(lineno)) {
                out += ", line: " + lineno;
            }
            out += " )";
        }

        console.assert(expr, out);
    };

    var log = Utils.log = function () {
        // Thanks to Paul Irish for this one:
        //   http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
        log.history = log.history || [];
        log.history.push(arguments);
        // Make sure console is present
        if ('object' === typeof console) {
            // Setup console and arguments
            var c = console[console.warn ? 'warn' : 'log'],
                args = Array.prototype.slice.call(arguments),
                a;
            // Add marker to first argument if it's a string
            if (typeof arguments[0] === 'string') {
                var s = args[0];
            }
            // Apply console.warn or .log if not supported
            a = c.apply ? c.apply(console, args) : c(args);
        }
    };

    var assert_disabled = Utils.assert_disabled = function () {
        // DO NOTHING
    };

    var log_disabled = Utils.log_disabled = function () {
        // DO NOTHING
    };

    var includeScript = Utils.includeScript = function (js) {
        document.write('<script src="' + js + '"></script>');
    };

    var importScripts = Utils.importScripts = (function (globalEval) {
        var xhr = new XMLHttpRequest();
        return function importScripts() {
            var
                args = Array.prototype.slice.call(arguments),
                len = args.length,
                i,
                meta,
                data,
                content;

            for (i = 0; i < len; i++) {
                if (args[i].substr(0, 5).toLowerCase() === "data:") {
                    data = args[i];
                    content = data.indexOf(",");
                    meta = data.substr(5, content).toLowerCase();
                    data = decodeURIComponent(data.substr(content + 1));
                    if (/;\s*base64\s*[;,]/.test(meta)) {
                        data = atob(data);
                    }
                    if (/;\s*charset=[uU][tT][fF]-?8\s*[;,]/.test(meta)) {
                        data = decodeURIComponent(escape(data));
                    }
                } else {
                    xhr.open("GET", args[i], false);
                    xhr.send(null);
                    data = xhr.responseText;
                }
                globalEval(data);
            }
        };
    }(eval));

    var usingScript = Utils.usingScript = function (js) {
        try {
            log("includeScript: ", js);
            includeScript(js);
        } catch (e) {
            log("importScripts: ", js);
            importScripts(js);
        }
    };

    var getScriptPath = Utils.getScriptPath = function (jsfile) {
        var e = {};
        var htmlPath = "";
        var jsPath = "";

        if (document.location.protocol === 'file:') {
            e.BasePath = unescape(document.location.pathname.substr(1));
            //e.BasePath = e.BasePath.replace(/\/\//gi, '/' ) ;
            e.BasePath = 'file://' + e.BasePath.substring(0, e.BasePath.lastIndexOf('/') + 1);
            e.FullBasePath = e.BasePath;
        } else {
            e.BasePath = document.location.pathname.substring(0, document.location.pathname.lastIndexOf('/') + 1);
            e.FullBasePath = document.location.protocol + '//' + document.location.host + e.BasePath;
        }

        htmlPath = e.FullBasePath;
        var i,
            at,
            src,
            slc,
            scriptTag = document.getElementsByTagName("script");

        for (i = 0; i < scriptTag.length; i++) {
            src = scriptTag[i].src;
            at = src.lastIndexOf(jsfile);
            if (at !== -1) {
                at++;
                // scriptTag[i].src.replace( /\/\//gi, '/');
                slc = src.toLowerCase();
                if (slc.indexOf("file://") === 0) {
                    jsPath = src.substring(0, at);
                    break;
                } else if (slc.indexOf("http://") === 0) {
                    jsPath = src.substring(0, at);
                    break;
                } else if (slc.indexOf("https://") === 0) {
                    jsPath = src.substring(0, at);
                    break;
                } else if (slc.indexOf("../") === 0) {
                    jsPath = htmlPath + src.substring(0, at);
                    break;
                } else if (slc.indexOf("./") === 0) {
                    jsPath = htmlPath + src.substring(0, at);
                    break;
                } else if (slc.indexOf("/") === 0) {
                    if (document.location.protocol === 'http:' || document.location.protocol === 'https:') {
                        jsPath = document.location.protocol + "//" + document.location.host + src.substring(0, at);
                    }
                    break;
                } else if (slc.search(/^([a-z]{1}):/) >= 0) {
                    jsPath = src.substring(0, at);
                    break;
                } else {
                    jsPath = htmlPath;
                }
            }
        }
        return jsPath;
    };


    var addCSSFiles = Utils.addCSSFiles = (function () {
        var addCSS = function (cssfile) {
            var link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = cssfile;
            document.getElementsByTagName("head")[0].appendChild(link);
        };

        return function addCSSFiles() {
            var
                args = Array.prototype.slice.call(arguments),
                len = args.length,
                i;

            for (i = 0; i < len; i++) {
                addCSS(args[i]);
            }
        };
    }());


    var addCSSStyle = Utils.addCSSStyle = (function () {
        var addStyle = function (cssfile, cssclass, cssid) {
            var link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = cssfile;
            if (Utils.notEmpty(cssid)) {
                link.id = cssid;
            }
            if (Utils.notEmpty(cssclass)) {
                link.className = cssclass;
            }
            document.getElementsByTagName("head")[0].appendChild(link);
        };

        return function addCSSStyle() {
            var
                args = Array.prototype.slice.call(arguments),
                len = args.length
                ;

            if (len == 1) {
                addStyle(args[0], '', '');
            } else if (len == 2) {
                addStyle(args[0], args[1], '');
            } else if (len == 3) {
                addStyle(args[0], args[1], args[2]);
            } else {
                log("invalid args: " + args);
            }
        };
    }());


    var genRandomInt = Utils.genRandomInt = function (minVal, maxVal) {
        if (minVal === undefined) {
            minVal = 0;
        }
        if (maxVal === undefined) {
            maxVal = 4294967295;
        }
        return Math.floor(Math.random() * (maxVal - minVal + 1) + minVal);
    };

    Function.prototype.inherits = function (superClass) {
        if (superClass.constructor == Function) { /* == */
            // Normal Inheritance:
            this.prototype = new superClass();
            this.prototype.constructor = this;
            this.prototype.__super = superClass.prototype;
        } else {
            // Pure Virtual Inheritance:
            this.prototype = superClass;
            this.prototype.constructor = this;
            this.prototype.__super = superClass; // NOT: superClass.prototype
        }
        return this;
    };

    var getWindowSize = Utils.getWindowSize = function () {
        var w = 0, h = 0;

        if (window.innerWidth) {
            w = window.innerWidth;
        } else if ((document.body) && (document.body.clientWidth)) {
            w = document.body.clientWidth;
        }
        if (document.documentElement && document.documentElement.clientWidth) {
            w = document.documentElement.clientWidth;
        }

        if (window.innerHeight) {
            h = window.innerHeight;
        } else if ((document.body) && (document.body.clientHeight)) {
            h = document.body.clientHeight;
        }
        if (document.documentElement && document.documentElement.clientHeight) {
            h = document.documentElement.clientHeight;
        }

        var s = [w, h];
        return s;
    };

    var getQueryString = Utils.getQueryString = function () {
        var result = location.search.match(new RegExp("[\?\&][^\?\&]+=[^\?\&]+", "g"));
        if (isEmpty(result)) {
            return "";
        }
        var i;
        for (i = 0; i < result.length; i++) {
            result[i] = result[i].substring(1);
        }
        return result;
    };

    var getQueryStringByName = Utils.getQueryStringByName = function (name) {
        var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
        if (isEmpty(result) || result.length < 1) {
            return "";
        }
        return result[1];
    };

    var getQueryStringByIndex = Utils.getQueryStringByIndex = function (index) {
        if (isNull(index)) {
            return "";
        }
        var queryStringList = getQueryString();
        if (index >= queryStringList.length) {
            return "";
        }
        var result = queryStringList[index];
        var startIndex = result.indexOf("=") + 1;
        result = result.substring(startIndex);
        return result;
    };

    var ajaxOptions = Utils.ajaxOptions = function (callbackClass, serviceUri, dataArray,
        timeoutMS, clearForm, resetForm) {
        // refer to:
        //   http://www.cnblogs.com/zengen/archive/2011/03/25/1995761.html
        if (timeoutMS === undefined) {
            timeoutMS = 60000;
        }
        if (clearForm === undefined) {
            clearForm = true;
        }
        if (resetForm === undefined) {
            resetForm = true;
        }

        var options = {
            url: serviceUri,            // override for form's 'action' attribute
            cache: false,
            type: 'post',               // 'get' or 'post', override for form's 'method' attribute
            dataType: 'json',           // expected data type of the response. One of: null, 'xml', 'script', or 'json'
            clearForm: clearForm,       // clear all form fields after successful submit
            resetForm: resetForm,       // reset the form after successful submit
            timeout: timeoutMS,         // $.ajax options can be used here too, for example: 10000 (=10 seconds)
            data: dataArray,
            // target: '#divToUpdate',  // div element(s) to be updated with server response
            beforeSerialize: (function (theClass) {
                return function (jqForm, options) {
                    if (theClass.beforeSerialize !== undefined) {
                        return theClass.beforeSerialize({
                            'jqForm': jqForm,
                            'options': options});
                    }

                    // return false to cancel submit
                    return true;
                };
            }(callbackClass)),
            beforeSubmit: (function (theClass) {
                return function (formData, jqForm, options) {
                    // pre-submit callback
                    // formData is an array; here we use $.param to convert it to a string to display it
                    // but the form plugin does this for you automatically when it submits the data
                    //   var queryString = $.param(formData);

                    // jqForm is a jQuery object encapsulating the form element.  To access the
                    // DOM element for the form do this:
                    //   var formElement = jqForm[0];
                    //   alert('About to submit: \n\n' + queryString);

                    if (theClass.beforeSubmit !== undefined) {
                        return theClass.beforeSubmit({
                            'formData': formData,
                            'jqForm': jqForm,
                            'options': options});
                    }

                    // here we could return false to prevent the form from being submitted;
                    // returning anything other than false will allow the form submit to continue
                    return true;
                };
            }(callbackClass)),
            beforeSend: (function (theClass) {
                return function (xhr) {
                    if (theClass.beforeSend !== undefined) {
                        theClass.beforeSend({
                            'xhr': xhr});
                    }
                };
            }(callbackClass)),
            success: (function (theClass) {
                return function (responseText, statusText, xhr, jqForm) {
                    // post-submit callback
                    // for normal html responses, the first argument to the success callback
                    // is the XMLHttpRequest object's responseText property

                    // if the ajaxForm method was passed an Options Object with the dataType
                    // property set to 'xml' then the first argument to the success callback
                    // is the XMLHttpRequest object's responseXML property

                    // if the ajaxForm method was passed an Options Object with the dataType
                    // property set to 'json' then the first argument to the success callback
                    // is the json data object returned by the server

                    // responseText or responseXML value (depending on the value of the dataType option).
                    // statusText
                    // xhr (or the jQuery-wrapped form element if using jQuery < 1.4)
                    // jQuery-wrapped form element (or undefined if using jQuery < 1.4)

                    //   alert('status: ' + statusText + '\n\nresponseText: \n' + responseText);
                    if (theClass.success !== undefined) {
                        theClass.success({
                            'responseText': responseText,
                            'statusText': statusText,
                            'xhr': xhr,
                            'jqFrom': jqForm});
                    }
                };
            }(callbackClass)),
            error: (function (theClass) {
                return function (xhr, statusText, errorText) {
                    // callback function to be invoked upon error
                    //   alert('form submit failed! Server Response: ' + data.responseText);
                    if (theClass.error !== undefined) {
                        theClass.error({
                            'xhr': xhr,
                            'statusText': statusText,
                            'errorText':  errorText});
                    }
                };
            }(callbackClass)),
            complete : (function (theClass) {
                return function (xhr, statusText) {
                    if (theClass.complete !== undefined) {
                        theClass.complete({
                            'xhr': xhr,
                            'statusText': statusText});
                    }
                };
            }(callbackClass))
        };

        return options;
    };

    /**
     * Month - M
     * Day - d
     * Hour - h
     * Miniute - m
     * Second - s
     * Quarter - q
     * Year - y
     * Millisecond - S
     * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S")
     *     2006-07-02 08:09:04.423
     * (new Date()).Format("yyyy-M-d h:m:s.S")
     *     2013-7-4 9:18:12.18
     */
    Date.prototype.Format = function(fmt) {
        var o = {
            "M+" : this.getMonth()+1,
            "d+" : this.getDate(),
            "h+" : this.getHours(),
            "m+" : this.getMinutes(),
            "s+" : this.getSeconds(),
            "q+" : Math.floor((this.getMonth()+3)/3),
            "S"  : this.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("("+ k +")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            }
        }
        return fmt;
    };

    /**
     * Array.forEach implementation for IE support
     * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
     */
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var T, k;

            if (this == null) {
                throw new TypeError(" this is null or not defined");
            }

            var O = Object(this);

            /* Hack to convert O.length to a UInt32 */
            var len = O.length >>> 0;

            if ({}.toString.call(callback) != "[object Function]") {
                throw new TypeError(callback + " is not a function");
            }

            if (thisArg) {
                T = thisArg;
            }

            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }


    if (DEBUG) {
        Utils.log = log;
        Utils.assert = assert;
    } else {
        Utils.log = log_disabled;
        Utils.assert = assert_disabled;
    }

    Utils.charset = "UTF-8";

    if ($w.Utils === undefined) {
        $w.Utils = Utils;
    }

}(window));

