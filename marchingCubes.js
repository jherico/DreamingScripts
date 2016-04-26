var RADIUS = 0.4;   // Spawn within this radius (square)
var NUM_ENTITIES = 20000;           // number of entities to spawn
var ENTITY_SPAWN_LIMIT = 1000;
var ENTITY_SPAWN_INTERVAL = 0.1;

var UPDATE_INTERVAL = 0.05;  // Re-randomize the entity's position every x seconds / ms
var ENTITY_LIFETIME = 30;   // Entity timeout (when/if we crash, we need the entities to delete themselves)
var KEEPALIVE_INTERVAL = 5; // Refreshes the timeout every X seconds 

var Y_OFFSET = 1.5; // Spawn at an offset below the avatar
var TEST_ENTITY_NAME = "EntitySpawnTest";


(function() {
    
    this.makeBounceCube = function (properties) {
        var size = properties.hasOwnProperty('size') ? properties.size : 1.0;
        print("Size " + size);
        var duration =  properties.hasOwnProperty('duration') ? properties.duration : 5.0;
        print("Duration " + duration);
        var position = randomPositionXZ({ x: 0, y: 1, z: 0 }, RADIUS);
        var entity = Entities.addEntity({
            type: "Box",
            position: { x: 0, y: 1, z: 0 },
            color: randomColor(),
            visible: true,
            dimensions: { x: 0.01, y: 0.01, z: 0.01 },
            lifetime: duration * 2.0
        });
        var start = now();

        return {
            finished: false,
            update: function () {
                if (!this.finished) {
                    var current = now();
                    var progress = (current - start) / (1000.0 * duration);
                    if (progress <= 1.0) {
                        var sine = Math.sin(progress * Math.PI);
                        var value = sine * size;
                        Entities.editEntity(entity, {
                            dimensions: { x: value, y: value, z: value }
                        });
                    } else {
                        Entities.deleteEntity(entity);
                        this.finished = true;
                    } 
                }
            }
        };
    }
    
    var entities = [];

    var that = this;
    var elapsed = 0;
    function update(dt) {
        elapsed += dt;
        print(elapsed)
        if (elapsed > 0.01) {
            elapsed = 0;
            var doneCount = 0;
            for (var i = 0; i < entities.length; ++i) {
                var bounceCube = entities[i];
                bounceCube.update();
                if (bounceCube.finished) {
                    ++doneCount;
                }
            }
            if (doneCount == entities.length) {
                print("Done")
                Script.update.disconnect(update);
            }
        }
    }
   
    for (var i = 0; i < 1; ++i) {
        entities.push(makeBounceCube({
            duration: 0.4
        }));
    }

    Script.update.connect(update);
})();


//(function () {
//    var entities = [];
//    var entitiesToCreate = 0;
//    var entitiesSpawned = 0;
//
//
//    function clear () {
//        var ids = entities.findEntities(MyAvatar.position, 50);
//        var that = this;
//        ids.forEach(function(id) {
//            var properties = Entities.getEntityProperties(id);
//            if (properties.name == TEST_ENTITY_NAME) {
//                Entities.deleteEntity(id);
//            }
//        }, this);
//    }    
//    
//    function createEntities () {
//        print("Creating " + NUM_ENTITIES + " entities (UPDATE_INTERVAL = " + UPDATE_INTERVAL + ", KEEPALIVE_INTERVAL = " + KEEPALIVE_INTERVAL + ")");
//        entitiesToCreate = NUM_ENTITIES;
//        Script.update.connect(spawnEntities);
//    }
//
//    var spawnTimer = 0.0;
//    function spawnEntities (dt) {
//        if (entitiesToCreate <= 0) {
//            Script.update.disconnect(spawnEntities);
//            print("Finished spawning entities");
//        } 
//        else if ((spawnTimer -= dt) < 0.0){
//            spawnTimer = ENTITY_SPAWN_INTERVAL;
//
//            var n = Math.min(entitiesToCreate, ENTITY_SPAWN_LIMIT);
//            print("Spawning " + n + " entities (" + (entitiesSpawned += n) + ")");
//
//            entitiesToCreate -= n;
//
//            var center = MyAvatar.position;
//            center.y -= Y_OFFSET;
//
//            for (; n > 0; --n) {
//                entities.push(makeEntity({
//                    type: "Box",
//                    name: TEST_ENTITY_NAME,
//                    position: randomPositionXZ(center, RADIUS),
//                    color: randomColor(),
//                    dimensions: randomDimensions(),
//                    lifetime: ENTITY_LIFETIME
//                }));
//            }
//        }
//    }
//
//    function despawnEntities () {
//        print("despawning entities");
//        entities.forEach(function (entity) {
//            entity.destroy();
//        });
//        entities = [];
//    }
//
//    var keepAliveTimer = 0.0;
//    var updateTimer = 0.0;
//
//    // Runs the following entity updates:
//    // a) refreshes the timeout interval every KEEPALIVE_INTERVAL seconds, and
//    // b) re-randomizes its position every UPDATE_INTERVAL seconds.
//    // This should be sufficient to crash the client until the entity tree bug is fixed (and thereafter if it shows up again).
//    function updateEntities (dt) {
//        var updateLifetime = ((keepAliveTimer -= dt) < 0.0) ? ((keepAliveTimer = KEEPALIVE_INTERVAL), true) : false;
//        var updateProperties = ((updateTimer -= dt) < 0.0) ? ((updateTimer = UPDATE_INTERVAL), true) : false;
//
//        if (updateLifetime || updateProperties) {
//            var center = MyAvatar.position;
//            center.y -= Y_OFFSET;
//
//            entities.forEach((updateLifetime && updateProperties && function (entity) {
//                entity.update({
//                    lifetime: entity.getAge() + ENTITY_LIFETIME,
//                    position: randomPositionXZ(center, RADIUS)
//                });
//            }) || (updateLifetime && function (entity) {
//                entity.update({
//                    lifetime: entity.getAge() + ENTITY_LIFETIME
//                });
//            }) || (updateProperties && function (entity) {
//                entity.update({
//                    position: randomPositionXZ(center, RADIUS)
//                });
//            }) || null, this);
//        }
//    }
//
//    function init () {
//        Script.update.disconnect(init);
//        clear();
//        createEntities();
//        Script.update.connect(updateEntities);
//        Script.scriptEnding.connect(despawnEntities);
//    }
//    Script.update.connect(init);
//})();