"use strict";

var SIMPLE_MODEL_ROOT = "../assets/simple/";
Script.include("./Austin.js");
Script.include(SIMPLE_MODEL_ROOT + "models.js");

print("Model count " + SimpleWorld.models.length);

var ENTITY_LIFETIME = 600;
var TEST_ENTITY_NAME = "SimpleWorldTest";
var SIDE = 10;

var SCALE = 1 / 50;
var MAP = {};
var GRID_UNIT = 0.1;

SimpleWorld.models.forEach(function(object) {
    MAP[object.path] = object;
    MAP[Script.resolvePath(SIMPLE_MODEL_ROOT + object.path)] = object;

    if (!("dimensions" in object)) {
        print(object.path);
        return;
    }
    object["fullDimensions"] = Vec3.multiply(object.dimensions, object.scale * SCALE);
    var gridSize = Vec3.multiply(object.fullDimensions, 1 / GRID_UNIT);
    gridSize.x = Math.ceil(gridSize.x);
    gridSize.z = Math.ceil(gridSize.z);
    gridSize = Vec3.multiply(gridSize, GRID_UNIT);
    if (gridSize.z < object.fullDimensions.z) {
        print("FAIL FAIL FAIL")
    }
    if (gridSize.x < object.fullDimensions.x) {
        print("FAIL FAIL FAIL")
    }
    object["gridSize"] = gridSize;
    object["margin"] = Vec3.multiply(Vec3.subtract(gridSize, object.fullDimensions), 0.5); 
});

function wipe() {
    Entities.findEntities(MyAvatar.position, 50).forEach(function(id) {
        var properties = Entities.getEntityProperties(id);
        if (properties.name != TEST_ENTITY_NAME) {
            return;
        }
        Entities.deleteEntity(id);
    });
}

function removeDupes() {
    var seen = {};
    Entities.findEntities(MyAvatar.position, 50).forEach(function(id) {
        var properties = Entities.getEntityProperties(id);
        if (properties.name != TEST_ENTITY_NAME) {
            return;
        }
        var model = properties.modelURL;
        if (model in seen) {
            print("Duplicated model " + id);
            Entities.deleteEntity(id);
            return;
        }
        seen[model] = true;
    });
}

function volume(v) {
    return v.x * v.y * v.z;
}

function fixupDimensions() {
    Entities.findEntities(MyAvatar.position, 50).forEach(function(id) {
        var properties = Entities.getEntityProperties(id);
        if (properties.name != TEST_ENTITY_NAME) {
            return;
        }

        var dimensions = properties.dimensions;
        var len = Vec3.length(Vec3.subtract(dimensions, {
            x: 0.1,
            y: 0.1,
            z: 0.1
        }));
        if (len < 0.001) {
            print("Needs reset " + id);
            if (properties.naturalDimensions.x === 0) {
                properties.naturalDimensions.x = 0.0001;
            }
            if (properties.naturalDimensions.y === 0) {
                properties.naturalDimensions.y = 0.0001;
            }
            if (properties.naturalDimensions.z === 0) {
                properties.naturalDimensions.z = 0.0001;
            }
            Entities.editEntity(id, {
                dimensions: properties.naturalDimensions,
            });
        }
    });
}

function updateDimensions() {
    var volumes = [];
    Entities.findEntities(MyAvatar.position, 50).forEach(function(id) {
        var properties = Entities.getEntityProperties(id);
        if (properties.name != TEST_ENTITY_NAME) {
            return;
        }
        var object = MAP[properties.modelURL];
        var dimensions = properties.dimensions;
        object["dimensions"] = dimensions
        var v = volume(dimensions);
        if (v < 0.0003) {
            object.scale = 100
        } else {
            object.scale = 1
        }
        volumes.push([ v, properties.modelURL ]);
    }, this);
    volumes.sort(function(a, b) {
        return a[0] - b[0];
    });
    for (var i = 0; i < volumes.length; ++i) {
        print(volumes[i]);
    }

}

function rescale(v, target) {
    var l = Math.max(v.x, Math.max(v.y, v.z));
    var scale = target / l;
    return Vec3.multiply(v, scale);
}

function build() {
    for (var i = 0; i < SIDE; ++i) {
        for (var j = 0; j < SIDE; ++j) {
            for (var k = 0; k < SIDE; ++k) {
                var offset = (k * SIDE * SIDE) + (j * SIDE) + i;
                if (offset >= SimpleWorld.models.length) {
                    continue;
                }

                var model = SimpleWorld.models[offset];
                if (!("dimensions" in model)) {
                    print("Skipping missing dimesions in " + model.path);
                    continue;
                }
                var fullPath = Script.resolvePath(SIMPLE_MODEL_ROOT + model.path);
                var entity = Entities.addEntity({
                    type: "Model",
                    name: TEST_ENTITY_NAME,
                    modelURL: fullPath,
                    position: {
                        x: i,
                        y: j + 0.5,
                        z: k
                    },
                    dimensions: rescale(model.dimensions, 0.5),
                    visible: true,
                    
                });
                // newEntityIds.push(entity);
            }
        }
    }
}

var currentIndex = 0;
var currentEntity;
var currentOrientation = { x: 0, y: 0, z: 0, w: 1 };

function yaw(a) {
    var y = -Math.sin( a / 2.0 );
    var w = Math.cos( a / 2.0 );
    var l = Math.sqrt((y * y) + (w * w));
    return { w: w / l, x: 0, y: y / l, z: 0 };
}

function rotate() {
    if (currentEntity) {
        currentOrientation = yaw(Date.now() / 1000);
        Entities.editEntity(currentEntity, {
            rotation: currentOrientation
        });
        Script.setTimeout(rotate, 50);
    }
}


function review() {
    if (currentEntity) {
        Entities.deleteEntity(currentEntity);
        currentEntity = null;
    }
    
    if (currentIndex < SimpleWorld.models.length) {
        var model = SimpleWorld.models[currentIndex];
        if (!("dimensions" in model)) {
            print("Skipping missing dimesions in " + model.path);
        } else {
            var fullPath = Script.resolvePath(SIMPLE_MODEL_ROOT + model.path);
            var dimensions = Vec3.multiply(model.dimensions, model.scale);
            var max2d = Math.max(dimensions.x, dimensions.z);
            currentEntity = Entities.addEntity({
                type: "Model",
                name: TEST_ENTITY_NAME,
                modelURL: fullPath,
                position: { x: 0, y: 0, z: max2d * -1 },
                registrationPoint: { x: 0.5, y: 0, z: 0.5 },
                dimensions: dimensions,
                rotation: currentOrientation,
                visible: true,
            });
        }
        ++currentIndex;
        Script.setTimeout(review, 200);
    }
}

function layout() {
    var x = 0; var z = 0;
    var zinc = 0;
    SimpleWorld.models.sort(function(a, b) {
        if (!("gridSize" in a)) {
            print(JSON.stringify(a));
        }
        aa = a.gridSize.x * a.gridSize.z;
        bb = b.gridSize.x * b.gridSize.z;
        return aa - bb;
    });
    SimpleWorld.models.forEach(function(model) {
        if (!("dimensions" in model)) {
            print("Skipping missing dimesions in " + model.path);
            return;
        }

        var fullPath = Script.resolvePath(SIMPLE_MODEL_ROOT + model.path);
        var dimensions = Vec3.multiply(model.dimensions, model.scale);
        currentEntity = Entities.addEntity({
            type: "Model",
            name: TEST_ENTITY_NAME,
            modelURL: fullPath,
            position: { x: x, y: 0, z: z },
            registrationPoint: { x: 0.0, y: 0, z: 0.0 },
            dimensions: model.fullDimensions,
            lifetime: 600,
            visible: true,
        });
        x += model.gridSize.x;
        zinc = Math.max(zinc, model.gridSize.z);

        if (x > 500 * SCALE) {
            x = 0;
            z += zinc;
            print("zinc " + zinc);
            zinc = 0;
        }
    });
}

wipe();
//build();
//review();
//rotate();
layout();

// removeDupes();
// fixupDimensions();
// updateDimensions();

// //var newEntityIds = [];

//var foo = JSON.stringify(SimpleWorld.models);
//print(foo);

// Script.setTimeout(function() {
// newEntityIds.forEach(function(id) {
// var properties = Entities.getEntityProperties(id);
// if (properties.naturalDimensions.x != 1) {
// Entities.editEntity(id, {
// dimensions: rescale(properties.naturalDimensions),
// });
// }
// });
// }, 3 * 1000);

// Script.stop();
