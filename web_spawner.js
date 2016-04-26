print("Startup");


var RADIUS = 4;   // Spawn within this radius (square)
var ENTITY_SPAWN_LIMIT = 20;
var ENTITY_SPAWN_INTERVAL = 0.01;
var UPDATE_INTERVAL = 0.05;  // Re-randomize the entity's position every x seconds / ms
var ENTITY_LIFETIME = 60;   // Entity timeout (when/if we crash, we need the entities to delete themselves)
var KEEPALIVE_INTERVAL = 5; // Refreshes the timeout every X seconds 
var Y_OFFSET = 1.5; // Spawn at an offset below the avatar
var TEST_ENTITY_NAME = "EntitySpawnTest";



 function randomPositionXZ(center, radius) {
    return {
        x: center.x + (Math.random() * radius * 2.0) - radius,
        y: center.y,
        z: center.z + (Math.random() * radius * 2.0) - radius
    };
};

var CENTER = { x: 0, y: 0, z: 0 } 

function makeWeb() {
    var position = randomPositionXZ(CENTER, RADIUS);
    var entity = Entities.addEntity({
        type: "Web",
        position: position,
        visible: true,
        dimensions: { x: .4, y: 0.2, z: 0.01 },
        lifetime: ENTITY_LIFETIME,
        url: "http://www.google.com",
    });
}

var entities = [];
var count = 0;
var acc = 0; 
print("Init");
function update(delta) {
    acc += delta;
    if (acc >= ENTITY_SPAWN_INTERVAL) {
        if (count < ENTITY_SPAWN_LIMIT) {
            makeWeb();
            ++count;
        }
        // ... stuff
        acc = 0;
    }
}


Script.setTimeout(function(){
    Script.update.connect(update);
}, 5000);

