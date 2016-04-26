"use strict";

Script.include("./Austin.js");

var ENTITY_SCRIPT_URL = Script.resolvePath("./entity/qmlStress.js");
var ENTITY_SPAWN_LIMIT = 500;
var ENTITY_LIFETIME = 600; 
var RADIUS = 1.0;   // Spawn within this radius (square)
var TEST_ENTITY_NAME = "EntitySpawnTest";

var center = MyAvatar.position;

for (var i = 0; i < ENTITY_SPAWN_LIMIT; ++i) {
    var properties = {
        type: "Box",
        name: TEST_ENTITY_NAME,
        position: AUSTIN.randomPositionXZ(center, RADIUS),
        color: AUSTIN.randomColor(),
        dimensions: AUSTIN.randomDimensions(),
        lifetime: ENTITY_LIFETIME,
        script: ENTITY_SCRIPT_URL,
    };
    var entity = Entities.addEntity(properties);
}

Script.stop();
