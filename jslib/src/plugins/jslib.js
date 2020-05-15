
/**
 * jslib.js
 *
 * http://www.cleancss.com/html-beautify/
 */
var JSLib = function (assetsRoot) {
    this._init(assetsRoot);
};

JSLib.getInstance = function (assetsRoot) {
    var ob = new JSLib(assetsRoot);
    return ob;
};

/**
 * static variable: VERSION
 * will be replaced by version.txt after make
 */
JSLib.prototype._version = "@VERSION";

JSLib.prototype._init = function (assetsRoot) {
    var assets_js = assetsRoot + "/js/";
    var assets_css = assetsRoot + "/css/";

    var browser = Utils.getBrowserAgent();
    Utils.log(browser.agent);
};

// public:
//
JSLib.prototype.toString = function () {
    return "[javascript JSLib]";
};
