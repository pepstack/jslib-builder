
/**
 * error.js
 */
var ErrorClass = function (message, source, sourceFile, sourceLineNo) {
    this.init(message, source, sourceFile, sourceLineNo);
};

ErrorClass.inherits(Error);

ErrorClass.prototype.init = function (message, source, sourceFile, sourceLineNo) {
    // error message
    this.message = message;

    // source class name
    this.source = source;

    // source filename
    this.sourceFile = sourceFile;

    // line no in source filename
    this.sourceLineNo = sourceLineNo;
};

ErrorClass.prototype.toString = function () {
    return "[javascript ErrorClass]";
};

ErrorClass.prototype.print = function () {
    var msg;

    if (__not_null(this.source)) {
        msg = this.source + " Error";
    } else {
        msg = "Error";
    }

    if (__not_null(this.message)) {
        msg += ": " + this.message + ".";
    } else {
        msg += ".";
    }

    if (__not_null(this.sourceFile)) {
        msg += " ( " + this.sourceFile;

        if (__not_null(this.sourceLineNo)) {
            msg += " : line " + this.sourceLineNo;
        }

        msg += " )";
    }

    return msg;
};
