var console;

Script.include("./Austin.js");


hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
    } : null;
}

AUSTIN.SolarSystem = {};

AUSTIN.SolarSystem.Bodies = [
    {
        name: "Sun",
        //radius: 109,
        radius: 11,
        //radius: 0.05,
        distance: 0,
        period: 0,
        color: "#FC7222",
        children: [
            {
                name: "Mercury",
                radius: 0.3839,
                distance: 0.4677,
                period:  0.24,
                color: "#868489",
            },
            {
                name: "Venus",
                radius: 0.95,
                distance: 0.73,
                period:  0.62,
                color: "#E0DBD8",
            },
            {
                name: "Earth",
                radius: 1,
                distance: 1,
                period: 1,
                color: "#002AFF",
                children: [
                    {
                        name: "Moon",
                        radius: 0.273,
                        distance: 0.00257,
                        period: 0.5,
                        color: "#827D7C",
                    },
                ]
            },
            {
                name: "Mars",
                radius: 0.533,
                distance: 1.523679,
                period: 1.8808,
                color: "#D78456",
            },
            {
                name: "Jupiter",
                radius: 11.209,
                distance: 5.20260,
                period: 11.8618 ,
                color: "#D78456",
            },
        ]
    },
]

var ENTITY_LIFETIME = 60

// 1 year = 60 seconds
var SPEED = Math.radians(6);
var DISTANCE_SCALE = 0.1
var SIZE_SCALE = 0.05

function createCelestialBodies(children, parent) {
    for (var i in children) {
        var child = children[i];
        var name = child.name;
        var parentId;
        if (parent) {
            var parentProperties = Entities.getEntityProperties(parent);
            var angularVelocity = SPEED / child.period;
            console.log("Creating orbit proxy for " + name);
            console.log("Orbital speed: " + angularVelocity)
            console.log("Position " + AUSTIN.vec3toStr(parentProperties.position));
            console.log("Parent ID " + parent);
            parentId = Entities.addEntity({
                name: name + ".OrbitProxy",
                type: "Box",
                visible: true,
                collisionless: true,
                dynamic: true,
                parentID: parent,
                dimensions: { x: 0.01, y: 1.0, z: 0.01 },
                lifetime: ENTITY_LIFETIME,
                angularDamping: 0,
                angularVelocity: { x: 0, y: angularVelocity, z: 0 },
            });
            console.log("Created " + parentId + " for " + name) ;
        }

        var planetProperties = {
            type: "Sphere",
            name: child.name,
            collisionless: true,
            color: hexToRgb(child.color),
            localPosition: { x: DISTANCE_SCALE * child.distance, y: 0, z: 0 },
            lifetime: ENTITY_LIFETIME,
            dimensions: Vec3.multiply(Vec3.ONE, SIZE_SCALE * child.radius),
        };
        
        if (parentId) {
            planetProperties.parentID = parentId;
        }

        var newBody = Entities.addEntity(planetProperties);
        if (child.children) {
            DISTANCE_SCALE *= 10;
            SIZE_SCALE *= 3
            createCelestialBodies(child.children, newBody);
            SIZE_SCALE /= 3;
            DISTANCE_SCALE /= 10;
        }
    }
}

createCelestialBodies(AUSTIN.SolarSystem.Bodies);

//Script.stop();