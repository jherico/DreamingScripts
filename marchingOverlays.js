


Script.include("./Austin.js");
Script.include("./noise/perlin.js");

var NOISE_AMPLITUDES = [];
var NOISE_DIVISORS = [];

(function(){
    var max = 0;
    var NOISE_POWERS = [];
    var ROOT_2 = Math.sqrt(2);
    for (var i = 0; i < 100; ++i) {
        NOISE_POWERS.push(Math.pow(ROOT_2, i));
        var amplitude = 1.0 / NOISE_POWERS[i];
        NOISE_AMPLITUDES.push(amplitude);
        max += amplitude;
        NOISE_DIVISORS.push(max);
    };
})()

function noise(x, y, z, octaves) {
    var result = 0;
    for (var i = 0; i < octaves; ++i) {
        var pass = i + 1;
        var localNoise = NOISE.perlin3(x * pass, y * pass, z * pass);
        localNoise *= NOISE_AMPLITUDES[i];
        result += localNoise;
    }
    return result / NOISE_DIVISORS[octaves];
}

var GRID_NOISE_SCALE = 6;
var GRID_NOISE_SPEED = 0.5;
var GRID_ELEMENT_SIZE = 0.05;
var GRID_ARRAY_SIZE = 25;
var ANIMATE_IN_DURATION = 3;
var ANIMATE_OUT_DURATION = 1;
var MINIMUM_BOX_SIZE = 0.001;
var NOISE_CUTOFF = 0.6;
var NOISE_RANGE = 1.0 - NOISE_CUTOFF;


// Based on the music
var BUILD_TIME = 9;
var MAX_DELAY = BUILD_TIME - ANIMATE_IN_DURATION;
var DOOR_DELAY = MAX_DELAY * 0.3
var DOOR_TRIM_DELAY = MAX_DELAY * 0.4
var WINDOW_DELAY = MAX_DELAY * 0.5
var WINDOW_TRIM_DELAY = MAX_DELAY * 0.6
var SIGN_DELAY = MAX_DELAY * 0.3
var LAMP_DELAY = MAX_DELAY * 0.8
var DOOR_SIGN_DELAY = MAX_DELAY


AUSTIN.Tardis = function() {
    this.position = { x: 1, y: 0.5, z: 0.2 };
    this.rotation = Quat.fromPitchYawRollDegrees(0, 45, 0),
    this.scale = 0.03;   
    this.PARTS = {
        base: {
            dimensions: { x: 50, y: 3, z: 50 },
            position: { x: 0, y: 0, z: 0 },
        },

        column: {
            dimensions: { x: 6, y: 90.5, z: 6 },
            position: { x: 21, y: 3, z: 21 },
            symmetry: 4,
        },

        door: {
            dimensions: { x: 42, y: 78, z: 1 },
            position: { x: 0, y: 3, z: 21 },
            symmetry: 4,
            delay: DOOR_DELAY,
            //color: { red: 255, green: 0, blue: 0 },
        },

        doorVertPanelSide: {
            dimensions: { x: 4, y: 78, z: 1 },
            position: { x: 17, y: 3, z: 21.2 },
            symmetry: 8,
            delay: DOOR_TRIM_DELAY,
        },

        doorVertPanelMiddle: {
            dimensions: { x: 6, y: 78, z: 1 },
            position: { x: 0, y: 3, z: 21.2 },
            symmetry: 4,
            delay: DOOR_TRIM_DELAY,
        },

        doorSign: {
            dimensions: { x: 11, y: 14, z: 1 },
            position: { x: (3 + 15) / -2 - .125 , y: 45 - .5, z: 21.1 },
            color: AUSTIN.Colors.OffWhite,
            delay: DOOR_SIGN_DELAY,
        },

        windowBack: {
            dimensions: { x: 12, y: 15, z: 1 },
            position: { x: (3 + 15) / 2 , y: 62.5, z: 21.1 },
            color: AUSTIN.Colors.OffWhite,
            symmetry: 8,
            delay: WINDOW_DELAY,
        },

        windowTrim1: {
            dimensions: { x: 12, y: .75, z: 1 },
            position: { x: (3 + 15) / 2 , y: 62.5, z: 21.2 },
            color: AUSTIN.Colors.White,
            symmetry: 8,
            delay: WINDOW_TRIM_DELAY,
        },

        windowTrim2: {
            dimensions: { x: 12, y: .75, z: 1 },
            position: { x: (3 + 15) / 2 , y: 62.5 + 15 - .75, z: 21.2 },
            color: AUSTIN.Colors.White,
            symmetry: 8,
            delay: WINDOW_TRIM_DELAY,
        },

        windowTrim3: {
            dimensions: { x: 12, y: .75, z: 1 },
            position: { x: (3 + 15) / 2 , y: 62.5 + 15 / 2, z: 21.2 },
            color: AUSTIN.Colors.White,
            symmetry: 8,
            delay: WINDOW_TRIM_DELAY,
        },
        
        windowTrim4: {
            dimensions: { x: .75, y: 15, z: 1 },
            position: { x: 3 + .75 / 2, y: 62.5, z: 21.2 },
            color: AUSTIN.Colors.White,
            symmetry: 8,
            delay: WINDOW_TRIM_DELAY,
        },
        
        windowTrim5: {
            dimensions: { x: .75, y: 15, z: 1 },
            position: { x: 6.75 + .75 / 2 , y: 62.5, z: 21.2 },
            color: AUSTIN.Colors.White,
            symmetry: 8,
            delay: WINDOW_TRIM_DELAY,
        },
        
        windowTrim6: {
            dimensions: { x: .75, y: 15, z: 1 },
            position: { x: 10.5 + .75 / 2, y: 62.5, z: 21.2 },
            color: AUSTIN.Colors.White,
            symmetry: 8,
            delay: WINDOW_TRIM_DELAY,
        },
        
        windowTrim7: {
            dimensions: { x: .75, y: 15, z: 1 },
            position: { x: 3 + 12 - .75 / 2, y: 62.5, z: 21.2 },
            color: AUSTIN.Colors.White,
            symmetry: 8,
            delay: WINDOW_TRIM_DELAY,
        },
        
        doorHorzPanelBottom: {
            dimensions: { x: 42, y: 4, z: 1 },
            position: { x: 0, y: 3, z: 21.2 },
            symmetry: 4,
            delay: DOOR_TRIM_DELAY,
        },

        doorHorzPanelMid1: {
            dimensions: { x: 42, y: 3.5, z: 1 },
            position: { x: 0, y: 3 + 4 + 15, z: 21.2 },
            symmetry: 4,
            delay: DOOR_TRIM_DELAY,
        },

        doorHorzPanelMid2: {
            dimensions: { x: 42, y: 3.5, z: 1 },
            position: { x: 0, y: 3 + 4 + 15 + 3.5 + 15, z: 21.2 },
            symmetry: 4,
            delay: DOOR_TRIM_DELAY,
        },

        doorHorzPanelMid3: {
            dimensions: { x: 42, y: 3.5, z: 1 },
            position: { x: 0, y: 3 + 4 + 15 + 3.5 + 15 + 3.5 + 15, z: 21.2 },
            symmetry: 4,
            delay: DOOR_TRIM_DELAY,
        },

        doorHorzPanelTop: {
            dimensions: { x: 42, y: 3.5, z: 1 },
            position: { x: 0, y: 3 + 78 - 3.5, z: 21.2 },
            symmetry: 4,
            delay: DOOR_TRIM_DELAY,
        },

        doorCrenels1: {
            dimensions: { x: 42, y: 1.25, z: 1.2 },
            position: { x: 0, y: 3 + 78, z: 21 + 0.8 },
            symmetry: 4,
            delay: DOOR_TRIM_DELAY,
        },

        dorCrenels2: {
            dimensions: { x: 42, y: 1.25, z: 1.2 },
            position: { x: 0, y: 3 + 78 + 1.25, z: 21 + 1.6 },
            symmetry: 4,
            delay: DOOR_TRIM_DELAY,
        },

        doorCrenels3: {
            dimensions: { x: 42, y: 1.25, z: 1.2 },
            position: { x: 0, y: 3 + 78 + 2.5, z: 21 + 2.4 },
            symmetry: 4,
            delay: DOOR_TRIM_DELAY,
        },

        crenels: {
            dimensions: { x: 5, y: 3, z: 4 },
            position: { x: 21, y: 93.5, z: 21},
            symmetry: 4,
            delay: DOOR_TRIM_DELAY,
        },

        sign: {
            dimensions: { x: 42, y: 5.25, z: 5.25 },
            position: { x: 0, y: 3 + 78 + 3.75, z: 21 + 2.4 },
            symmetry: 4,
            delay: SIGN_DELAY,
        },

        sign2: {
            type: "text3d",
            dimensions: { x: 40, y: 4.75, z: 5.4 },
            position: { x: 0, y: 3 + 78 + 4, z: 21 + 6.4 },
            color: { red: 0, green: 0, blue: 0 },
            symmetry: 4,
            delay: SIGN_DELAY,
        },
        
        top: {
            dimensions: { x: 42, y: 11.75, z: 42 },
            position: { x: 0, y: 84.75, z: 0},
        },
        top2: {
            dimensions: { x: 40, y: 2, z: 40 },
            position: { x: 0, y: 96.5, z: 0},
            delay: 0.5
        },
        laternBase: {
            dimensions: { x: 7, y: 1, z: 7 },
            position: { x: 0, y: 100.5, z: 0},
            delay: LAMP_DELAY,
        },
        latern: {
            dimensions: { x: 5, y: 6, z: 5 },
            position: { x: 0, y: 101.5, z: 0},
            color: AUSTIN.Colors.White,
            delay: LAMP_DELAY,
        },
        laternCap: {
            dimensions: { x: 7, y: 1, z: 7 },
            position: { x: 0, y: 107.5, z: 0},
            delay: LAMP_DELAY,
        },
        laternBall: {
            type: "sphere",
            dimensions: { x: 5, y: 5, z: 5 },
            position: { x: 0, y: 105.5, z: 0},
            delay: LAMP_DELAY,
        },
    }
    this.overlays = [];
    this.SYMMETRY_ROTATION = [
        Quat.fromPitchYawRollDegrees(0, 0, 0),
        Quat.fromPitchYawRollDegrees(0, 90, 0),
        Quat.fromPitchYawRollDegrees(0, 180, 0),
        Quat.fromPitchYawRollDegrees(0, -90, 0),
        Quat.fromPitchYawRollDegrees(0, 0, 0),
        Quat.fromPitchYawRollDegrees(0, 90, 0),
        Quat.fromPitchYawRollDegrees(0, 180, 0),
        Quat.fromPitchYawRollDegrees(0, -90, 0),
    ];
    return this;
}


AUSTIN.Tardis.prototype = {
    constructor: AUSTIN.Tardis,
    update: function(delta) {
        var that = this;
        this.overlays.forEach(function (overlay) {
            overlay.update(delta);
        });
    },
    build: function(position, rotation) {
        this.position = position || { x: 0, y: 0, z: 0 } ; //Vec3.ZERO;
        this.rotation = rotation || Quat.fromPitchYawRollDegrees(0, 0, 0);
        var now = AUSTIN.now();
        this.EXPLODE_START = now + 9.8 * 1000;
        var that = this;
        Object.keys(this.PARTS).forEach(function(partName){
            var partData = that.PARTS[partName];
            var symmetry = partData.symmetry || 1;
            var type = partData.type || "cube";
            var delay = partData.delay || 0;
            var color = partData.color || AUSTIN.Colors.TardisBlue;
            // Inches to meters
            var finalDimensions = Vec3.multiply(partData.dimensions, that.scale);
            var templatePosition = Vec3.multiply(partData.position, that.scale);
            templatePosition = Vec3.sum(templatePosition, { x: 0, y: finalDimensions.y / 2, z: 0 });
            for (var i = 0; i < symmetry; ++i) {
                var finalPosition = (function() {
                    var result = Vec3.multiply(templatePosition, 1);
                    if (i >= 4) { result.x *= -1; }
                    result = Vec3.multiplyQbyV(that.SYMMETRY_ROTATION[i], result);
                    result = Vec3.multiplyQbyV(that.rotation, result);
                    result = Vec3.sum(that.position, result);
                    return result;
                })();
                var finalRotation = Quat.multiply(that.rotation, that.SYMMETRY_ROTATION[i]);
                var overlayProperties = {
                    alpha: 0.0, solid: true, visible: true,
                    type: type,
                    color: color,
                    rotation: finalRotation,
                    position: finalPosition,
                    dimensions: finalDimensions,
                };
                if (type == "text3d") {
                    overlayProperties["text"] = "P O L I C E         B O X";
                    overlayProperties["backgroundColor"] = overlayProperties.color;
                    overlayProperties.color = AUSTIN.Colors.White;
                    overlayProperties["lineHeight"] = 0.1;
                    overlayProperties["topMargin"] = 0.01;
                }
                var overlay = new AUSTIN.Overlay(overlayProperties);
                overlay.finalProperties = overlayProperties;
                overlay.finalProperties.alpha = 1.0;
                overlay.finalDimensions = finalDimensions;
                overlay.delay = partData.delay || 0;
                overlay.finalRotation = finalRotation;
                overlay.finalPosition = finalPosition;
                overlay.edit({ scale: 0.001 });
                that.overlays.push(overlay);
            }
        });
                
        var that = this;
        for (var i = 0; i < this.overlays.length; ++i) {
            (function(){
                var overlayIndex = i;
                var overlay = that.overlays[i];
                //var avatarPoint = AUSTIN.avatarRelativePosition({x: 0, y: 1, z: -2 });
                var startingPosition = Vec3.multiply(overlay.finalPosition, Math.pow(Math.random() * 0.99, 10));
                if (overlay.delay) {
                    startingPosition = Vec3.multiply(overlay.finalPosition, Math.random() * 5 + 1);
                }
                var startingRotation = AUSTIN.randomRotation();
                overlay.animate("alpha", {
                    type: "easeOutQuad",
                    duration: ANIMATE_IN_DURATION,
                    end: 0.999,
                    delay: overlay.delay,
                });
                overlay.animate("rotation", {
                    type: "easeOutQuad",
                    duration: ANIMATE_IN_DURATION,
                    begin: startingRotation,
                    end: overlay.finalRotation,
                    interpolate: Quat.slerp,
                    delay: overlay.delay,
                });
                overlay.animate("scale", {
                    type: "easeOutQuad",
                    duration: ANIMATE_IN_DURATION,
                    begin: 0.001,
                    interpolate: function (a, b, alpha) { return Vec3.multiply(overlay.finalDimensions, alpha); },
                    delay: overlay.delay
                });
                overlay.animate("position", {
                    type: "easeOutQuad",
                    duration: ANIMATE_IN_DURATION,
                    begin: startingPosition,
                    end: overlay.finalPosition,
                    interpolate: Vec3.mix,
                    delay: overlay.delay,
                    completion: function() {
                        overlay.destroy();
                        that.overlays[overlayIndex] = new AUSTIN.Overlay(overlay.type, overlay.finalProperties);
                    }
                });                
                //var explodeStart = overlay.finalPosition;
                //var explodeEnd = Vec3.multiplyVbyV(explodeStart, {x: 1000, y: 1000, z: 1000 })
                //overlay.animate("position", {
                //    type: "easeOutQuad",
                //    duration: ANIMATE_OUT_DURATION,
                //    begin: explodeStart,
                //    end: explodeEnd,
                //    interpolate: Vec3.mix,
                //    startTime: EXPLODE_START,
                //    completion: function() { overlay.destroy(); }
                //});

            })();
        }
        this.overlays.forEach(function(overlay){
        });
    }
}

AUSTIN.AnimatedCube = function(parent, x, z) {
    this.x = x;
    this.z = z;
    this.parent = parent;
    this.pendingDestruction = false;
    this.position = {x: x * GRID_ELEMENT_SIZE, y: 0.5, z: z * GRID_ELEMENT_SIZE}
}
AUSTIN.AnimatedCube.prototype = {
    constructor: AUSTIN.AnimatedCube,
    create: function() {
        var that = this;
        this.gridOverlay = new AUSTIN.Overlay({
            type: "cube",
            position: this.position,
            color: AUSTIN.Colors.TronBlue,
            size: MINIMUM_BOX_SIZE,
            alpha: 1.0,
            solid: false,
            visible: true,
        });
        this.gridOverlay.animate("size", {
            type: "easeOutQuad",
            duration: ANIMATE_IN_DURATION,
            begin: MINIMUM_BOX_SIZE,
            end: GRID_ELEMENT_SIZE,
            completion: function() {
                that.gridOverlay.animate("size", {
                    type: "easeOutQuad",
                    duration: ANIMATE_OUT_DURATION,
                    begin: GRID_ELEMENT_SIZE,
                    end: MINIMUM_BOX_SIZE,
                    startTime: AUSTIN.now(),
                    completion: function() {
                        that.gridOverlay.destroy();
                    }
                });
            }
        });
        this.overlay = new AUSTIN.Overlay({
            type: "cube",
            position: this.position,
            color: { red: 128, green: 128, blue: 128 },
            size: MINIMUM_BOX_SIZE,
            alpha: 1.0,
            solid: true,
            visible: true,
        });
        this.overlay.animate("size", {
            type: "easeOutQuad",
            duration: ANIMATE_IN_DURATION * 2,
            begin: MINIMUM_BOX_SIZE,
            end: GRID_ELEMENT_SIZE,
        });
        this.overlay.animate("rotation", {
            type: "easeOutQuad",
            duration: ANIMATE_IN_DURATION,
            begin: AUSTIN.randomRotation(),
            end: { x: 0, y: 0, z: 0, w: 1 },
            interpolate: Quat.slerp,
        });
    },
    destroy: function() {
        if (this.pendingDestruction) {
            return;
        }
        this.pendingDestruction = true;
        // Immediately remove from our parent, even though we will animate out
        this.parent.grid[this.x][this.z] = null;
        this.parent.dead.push(this);
        var that = this;
        this.overlay.animate("size", {
            type: "easeOutQuad",
            duration: ANIMATE_OUT_DURATION,
            begin: GRID_ELEMENT_SIZE,
            end: MINIMUM_BOX_SIZE,
            completion: function() { that.overlay.destroy(); }
        });
        this.overlay.animate("color", {
            type: "easeOutQuad",
            duration: ANIMATE_OUT_DURATION,
            begin: this.color,
            end: AUSTIN.Colors.TronRed,
            interpolate: AUSTIN.Colors.mix,
        });
    },
    
    destroyed: function() {
        return this.overlay.destroyed() && this.gridOverlay.destroyed();
    },
    
    update: function(delta, noiseVal) {
        if (!this.pendingDestruction) {
            var color = (noiseVal - NOISE_CUTOFF) / NOISE_RANGE;
            var height = (color * 5 * GRID_ELEMENT_SIZE) + GRID_ELEMENT_SIZE;
            color = Math.pow(color, 0.2) * 255;
            this.color = { red: color, green: color, blue: color };
            this.overlay.edit({
                color: this.color,
                //position: { x: this.position.x, y: this.position.y + height / 2 , z: this.position.z },
                //dimensions: { x: GRID_ELEMENT_SIZE, y: height + GRID_ELEMENT_SIZE, z: GRID_ELEMENT_SIZE },
            });
        }
        this.overlay.update(delta);
        this.gridOverlay.update(delta);
    },
};
AUSTIN.Grid = function(width, depth) {
    this.grid = AUSTIN.createArray(width, depth);
    this.gridCount = AUSTIN.createArray(width, depth);
    this.elapsed = new AUSTIN.Elapsed();
    this.dead = [];
    this.lifeStep = 0;
    return this;
};
AUSTIN.Grid.prototype = {
    constructor: AUSTIN.Grid,

    forEachElement: function(callback) {
        for (var x = 0; x < GRID_ARRAY_SIZE; ++x) {
            for (var z = 0; z < GRID_ARRAY_SIZE; ++z) {
                callback(this.grid[x][z], x, z);
            }
        }
    },
    
    noise: function (x, z) {
        var noiseX = 7 + x / GRID_NOISE_SCALE;
        var noiseY = this.elapsed.age() * GRID_NOISE_SPEED;
        var noiseZ = 5 + z / GRID_NOISE_SCALE;
        var noiseVal = noise(noiseX, noiseY, noiseZ, 1);
        noiseVal += 1.0;
        noiseVal /= 2.0;
        noiseVal = Math.pow(noiseVal, 0.8);
        return noiseVal;
    },

    neighborCount: function(x, z) {
        var count = 0;
        for (var i = -1; i <= 1; ++i) {
            for (var j = -1; j <= 1; ++j) {
                if (i == 0 && j == 0) {
                    continue;
                }
                tx = (x + i + GRID_ARRAY_SIZE) % GRID_ARRAY_SIZE;
                tz = (z + j + GRID_ARRAY_SIZE) % GRID_ARRAY_SIZE;
                if (this.grid[tx][tz]) {
                    ++count;
                }
            }
        }
        return count;
    },
    
    initLife: function(delta) {
        if (GRID_ARRAY_SIZE >= 5) {
            this.grid[2][2] = new AUSTIN.AnimatedCube(this, 2, 2);
            this.grid[2][2].create();
            this.grid[2][3] = new AUSTIN.AnimatedCube(this, 2, 3);
            this.grid[2][3].create();
            this.grid[2][4] = new AUSTIN.AnimatedCube(this, 2, 4);
            this.grid[2][4].create();
        }
    },
    
    updateLife: function(delta) {
        this.lifeStep += delta;
        var that = this;
        this.forEachElement(function(element, x, z){
            if (element) {
                element.update(delta, 1.0);
            }
        });

        if (this.lifeStep > 0.1) {
            this.lifeStep = 0;
            
            this.forEachElement(function(element, x, z) {
                that.gridCount[x][z] = that.neighborCount(x, z);
            });
            this.forEachElement(function(element, x, z) {
                var neighborCount = that.gridCount[x][z];
                //Any live cell with fewer than two live neighbours dies, as if caused by under-population.
                //Any live cell with more than three live neighbours dies, as if by over-population.
                if (element && ((neighborCount < 2) || (neighborCount > 3))) {
                    element.destroy();
                }

                //Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                if (!element && (neighborCount === 3)) {
                    element = that.grid[x][z] = new AUSTIN.AnimatedCube(that, x, z);
                    that.grid[x][z].create();
                }
            });
            this.debugged = true;
        }
        this.updateDead(delta);
    },
    
    update: function(delta) {
        var that = this;
        this.forEachElement(function(element, x, z){
            var noiseVal = that.noise(x, z);
            if (!element) {
                if (noiseVal > NOISE_CUTOFF) {
                    element = that.grid[x][z] = new AUSTIN.AnimatedCube(that, x, z);
                    that.grid[x][z].create();
                }
            }
            if (element) {
                element.update(delta, noiseVal);
                if (!element.pendingDestruction) {
                    if (noiseVal < NOISE_CUTOFF) {
                        element.destroy();
                    } 
                }
            }
        });
        this.updateDead(delta);
    },
    
    updateDead: function(delta) {
        var that = this;
        var dead = this.dead.slice(0);
        this.dead = [];
        dead.forEach(function(box){
            if (!box.destroyed()) {
                box.update(delta);
                that.dead.push(box);
            }
        });

    }
}

NOISE.seed(AUSTIN.now());

//var QML_URL = "file:///C:/Users/bdavis/Git/dreaming/qml/TardisBuild.qml";
var QML_URL = "https://s3.amazonaws.com/DreamingContent/qml/TardisBuild.qml";

var qmlWindow = new OverlayWindow({
    source: QML_URL, 
    width: 128, height: 128,
    visible: false
});

qmlWindow.setPosition(30, 30);
qmlWindow.setVisible(true);

// Demonstrate handling an incoming message from the QML window
qmlWindow.fromQml.connect(function(message){
    print("Got message from QML in script");
    print(message)
})

// Demonstrate sending a message to the QML window
Script.setTimeout(function() {
    qmlWindow.sendToQml(["foo", "bar", {x: 1}]);
}, 1000);

Script.setTimeout(function() {
    EXPLODE_START = AUSTIN.now() + 9.8 * 1000;
    var tardis = new AUSTIN.Tardis();
    //var tardisLocation = AUSTIN.avatarRelativePosition({ x: 0, y: -1.2, z: -2 });
    var tardisLocation = { x: 0, y: 0, z: 0 };
    tardis.build(tardisLocation, MyAvatar.orientation);
    tardis.update(0);
    AUSTIN.updateEvery(0.01, function(delta) {
        tardis.update(delta);
    });
}, 1)

