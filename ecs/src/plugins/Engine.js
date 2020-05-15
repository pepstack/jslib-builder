/**
 * Engine.js
 *   2020-05-16
 */

var Engine = function () {
    this._init();
};


Engine.prototype.update = function (t) {
    Utils.log("Engine::update");
};


Engine.prototype._init = function () {

};


Engine.prototype.toString = function () {
    return "<class ecs.Engine>";
};