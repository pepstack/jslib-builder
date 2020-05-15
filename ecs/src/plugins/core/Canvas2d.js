/**
 * Canvas2d.js
 *   2020-05-16
 */

var Canvas2d = function (canvasID, divContainerID) {
    var canvasElement = $('#' + canvasID)[0];
    var divContainer = $('#' + divContainerID)[0];
    this._init(canvasElement, divContainer);
};


Canvas2d.prototype.update = function (t) {
    Utils.log("Canvas2d.update()");
};


Canvas2d.prototype._init = function (canvasElement, divContainer) {
    var
        self = this,
        container = divContainer,
        canvas = canvasElement,
        canvasContext = canvas.getContext("2d");

    if (!canvasContext) {
        throw new ErrorClass("canvas 2d not supported", "Canvas2d", "__FILE__", "__LINE__");
    }

    Object.defineProperty(this, 'width', {
        get: function () {
            return canvas.width;
        },
        set: function (val) {
            canvas.width = val;
        }
    });


    Object.defineProperty(this, 'height', {
        get: function () {
            return canvas.height;
        },
        set: function (val) {
            canvas.height = val;
        }
    });


    this.resize = function (newWidth, newHeight) {
        var w = newWidth;
        var h = newHeight;
        if (w === 0) {
            w = container.clientWidth;
        }
        if (h === 0) {
            h = container.clientHeight;
        }
        if (w === 0) {
            w = 1;
        }
        if (h === 0) {
            h = 1;
        }
        if (w !== canvas.width || h !== canvas.height) {
            canvas.width = w;
            canvas.height = h;
            canvasContext.moveTo(0, 0);
            canvasContext.moveTo(w, h);
            canvasContext.stroke();
            return true;
        }
        return false;
    };
};


// Implementations of CanvasInterface:
//
Canvas2d.prototype.toString = function () {
    return "<class ecs.Canvas2d>";
};
