"use strict";

Script.include("./Easings.js");

AUSTIN = {}

console = {
    log: function(str) {
        print(str);
    },
    warn: function(str) {
        print(str);
    },
    debug: function(str) {
        print(str);
    },
};


AUSTIN.findNearbyEntities = function(range, predicate) {
    if (!range) {
        range = 50;
    }
    var ids = Entities.findEntities(MyAvatar.position, 50);
    if (predicate) {
        var filtered = [];
        ids.forEach(function(id) {
            if (predicate(id)) {
                filtered.push(id);
            }
        });
        ids = filtered;
    }
    return ids;
}

AUSTIN.Colors = {
    TronBlue:  { red: 24, green: 202, blue: 230 },
    TronRed: { red: 251, green: 0, blue: 9 },
    TardisBlue: { red: 0, green: 59, blue: 111 },
    White: { red: 255, green: 255, blue: 255 },
    OffWhite: { red: 200, green: 200, blue: 200 },
    mix: function(c1, c2, alpha) {
        return {
            red: ((c2.red - c1.red) * alpha) + c1.red,
            green: ((c2.green - c1.green) * alpha) + c1.green,
            blue: ((c2.blue - c1.blue) * alpha) + c1.blue,
        };
    }
}

AUSTIN.avatarRelativePosition = function (v) {
    return Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, v));
}

AUSTIN.randomPosition = function (center, radius) {
    return {
        x: center.x + (Math.random() * radius * 2.0) - radius,
        y: center.x + (Math.random() * radius * 2.0) - radius,
        z: center.z + (Math.random() * radius * 2.0) - radius
    };
}

AUSTIN.randomRotation = function() {
    return Quat.fromPitchYawRollDegrees(
            Math.random() * 360 - 180,
            Math.random() * 360 - 180,
            Math.random() * 360 - 180);
}

AUSTIN.randomDimensions = function () {
    return {
        x: 0.1 + Math.random() * 0.5,
        y: 0.1 + Math.random() * 0.1,
        z: 0.1 + Math.random() * 0.5
    };
}

AUSTIN.randomPositionXZ = function (center, radius) {
    return {
        x: center.x + (Math.random() * radius * 2.0) - radius,
        y: center.y,
        z: center.z + (Math.random() * radius * 2.0) - radius
    };
}

AUSTIN.randomColor = function () {
    var shade = Math.floor(Math.random() * 255);
    var hue   = Math.floor(Math.random() * (255 - shade));

    return {
        red: shade + hue,
        green: shade,
        blue: shade
    };
}

AUSTIN.randomGray = function () {
    var shade = Math.floor(Math.random() * 255);

    return {
        red: shade,
        green: shade,
        blue: shade
    };
}

AUSTIN.now = function() {
    return new Date().valueOf();
}

/**
 * Create a new constructor function, whose prototype is the parent object's prototype.
 * Set the child's prototype to the newly created constructor function.
 **/
AUSTIN.extend = function(childObj, parentObj) {
    var tmpObj = function () {}
    tmpObj.prototype = parentObj.prototype;
    childObj.prototype = new tmpObj();
    childObj.prototype.constructor = childObj;
};

AUSTIN.createArray = function(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = AUSTIN.createArray.apply(this, args);
    }
    return arr;
}

AUSTIN.updateEvery = function(interval, callback) {
    (function(){
        var thisInterval = interval;
        var thisAccumulator = 0;
        Script.update.connect(function(delta){
            thisAccumulator += delta;
            if (thisAccumulator >= thisInterval) {
                callback(thisAccumulator);
                thisAccumulator = 0;
            }
        });
    })()
}

AUSTIN.Easing = function(properties) {
    var type = properties["type"]
    this.easingFunction = EASINGS[type] || EASINGS["def"];
    var delay = properties["delay"] || 0;
    this.startTime = properties["startTime"] || (AUSTIN.now() + delay * 1000);
    this.duration = properties["duration"] || 1.0;
    this.begin = properties["begin"] || 0.0;
    this.end = properties["end"] || 1.0;
    this.interpolate = properties["interpolate"] || function(begin, end, alpha) {
        return ((end - begin) * alpha) + begin;
    };
    this.completion = properties["completion"];
    return this;
}

AUSTIN.Easing.prototype = {
    constructor: AUSTIN.Easing,
    easingValue: function() {
        return this.easingFunction(this.age(), 0.0, 1.0, this.duration);
    },
    
    interpolatedValue: function(alpha) {
        if (undefined === alpha) {
            alpha = this.easingValue();
        }
        return this.interpolate(this.begin, this.end, alpha);
    },
    
    age: function() {
        return (AUSTIN.now() - this.startTime) / 1000.0;
    },

    expired: function() {
        return this.age() >= this.duration;
    },
    
    ready: function() {
        return AUSTIN.now() >= this.startTime;
    }
}

AUSTIN.Elapsed = function() {
    this.startTime = AUSTIN.now();
    return this;
}

AUSTIN.Elapsed.prototype = {
    constructor: AUSTIN.Elapsed,
    age: function() {
        return (AUSTIN.now() - this.startTime) / 1000.0;
    },
    reset: function() {
        this.startTime = AUSTIN.now();
    },
}

AUSTIN.Overlay = function(type, properties) {
    if (!properties) {
        properties = type;
        type = properties["type"];
        delete properties["type"];
    }
    this.type = type;
    this.id = Overlays.addOverlay(type, properties);
    this.destroyWithScript = true;
    this.animations = {};
    var that = this;
    
    var privateUpdate = function(delta) {
        if (!that.update(delta)) {
            that.stopUpdates();
        }
    };

    this.startUpdates = function() { Script.update.connect(privateUpdate); }
    this.stopUpdates = function() { Script.update.disconnect(privateUpdate); }

    Script.scriptEnding.connect(function(){
        if (that.destroyWithScript) {
            that.destroy();
        }
    });
    return this;
}


AUSTIN.Overlay.prototype = {
    constructor: AUSTIN.Overlay,

    edit: function(properties) {
        Overlays.editOverlay(this.id, properties);
    },

    destroy: function() {
        if (this.id) {
            Overlays.deleteOverlay(this.id);
            this.id = 0;
        }
    },
    
    destroyed: function() {
        return 0 === this.id;
    },
    
    animate: function(property, easingProperties) {
        if (0 === Object.keys(this.animations).length) {
            this.startUpdates();
        }
        if (!this.animations[property]) {
            this.animations[property] = [];
        }
        this.animations[property].push(new AUSTIN.Easing(easingProperties));
    },
    
    update: function(deltaTime) {
        var keys = Object.keys(this.animations);
        if (!keys.length) {
            return false;
        }

        var editProperties = {};
        var completions = [];
        var expiredKeys = [];
        keys.forEach(function(key){
            var animations = this.animations[key];
            var expiredCount = 0;
            for (var i = 0; i < animations.length; ++i) {
                var animation = animations[i];
                if (!animation) {
                    ++expiredCount;
                    continue;
                }
                if (!animation.ready()) {
                    continue;
                }
                // Check expired before getting the value
                if (animation.expired()) {
                    editProperties[key] = animation.interpolatedValue(1.0);
                    if (animation.completion) {
                        completions.push(animation.completion);
                    }
                    animations[i] = null;
                } else {
                    editProperties[key] = animation.interpolatedValue()
                }
            }
            if (expiredCount == animations.length) {
                expiredKeys.push(key);
            }
        }, this);
        this.edit(editProperties);
        completions.forEach(function(completion){ completion() });
        for (var i = 0; i < expiredKeys.length; ++i) {
            delete this.animations[expiredKeys[i]];
        }
        return true;
    }
};
