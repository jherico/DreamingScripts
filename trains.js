"use strict";

Script.include("./Austin.js");

vec3toStr = function(v, digits) {
    if (!digits) { digits = 3; }
    return "{ " + v.x.toFixed(digits) + ", " + v.y.toFixed(digits) + ", " + v.z.toFixed(digits)+ " }";
}

var trains = (function() {
    var that = {
        scale: 0.2,
        overlays: [],
        segments: [
          { l: 5, d: 0 },
          { l: 10, d: 1 },
          { l: 10, d: 2 },
          { l: 5, d: 3 },
          { l: 3, d: 0 },
        ],
        animations: [],
        train: { x: 0, y: 0 },
        trainOverlay: null,
        currentSegment: 0,
    };
    
    function update() {
        
    }
    
    function animateNext() {
        that.trainOverlay.animate("position", that.animations[that.currentSegment]);
        that.currentSegment++;
        that.currentSegment %= that.segments.length;
    }
    
    function worldPosition(x, y, z) {
        return { x: x * that.scale, y: y, z: z * that.scale }
    }
    
    function initialize() {
        var x = 0;
        var z = 0;
        that.trainOverlay = new AUSTIN.Overlay("sphere", {
            solid: true, visible: true,
            position: { x: 0, y: 0.6, z: 0 },
            dimensions: { x: 0.1, y: 0.1, z: 0.1 },
            color: AUSTIN.Colors.OffWhite,
        });
        that.segments.forEach(function(segment){
            var startingPoint = worldPosition(x, 0.6, z);
            for (var i = 0; i < segment.l; ++i) {
                switch (segment.d) {
                    case 0: ++z; break;
                    case 1: ++x; break;
                    case 2: --z; break;
                    case 3: --x; break;
                }
                var finalPosition = worldPosition(x, 0.5, z);
                var finalDimensions = { x: 0.95 * that.scale, y: 0.01, z: 0.95 * that.scale };
                var overlayProperties = {
                    solid: true, visible: true,
                    color: AUSTIN.Colors.TronBlue,
                    position: finalPosition,
                    dimensions: finalDimensions,
                };
                var overlay = new AUSTIN.Overlay("cube", overlayProperties);
            }
            var endingPoint = worldPosition(x, 0.6, z);
            var duration = 0.5 * segment.l;
            that.animations.push({
                type: "easeInOutCubic",
                duration: duration,
                begin: startingPoint,
                end: endingPoint,
                interpolate: Vec3.mix,
                completion: animateNext,
            });
        }, that);
        animateNext();
    }

    that.cleanup = function() {
    };

    initialize();
    return that;
}());

Script.scriptEnding.connect(trains.cleanup);
