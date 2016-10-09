Script.include("./Geo.js");
Script.include("../assets/simple/models.js")

var NY = { x: -74.0059, y: 0, z: 40.7128 };
var CHI = { x: -87.6298, y: 0, z: 41.8781 };
var SEA = { x: -122.3088, y: 0, z: 47.4502 };
var SFO = { x: -122.4194, y: 0, z: 37.7749 };
var LAX = { x: -118.4139235, y: 0, z: 33.9411931 };
var TOKYO = { x: 139.6917, y: 0, z: 35.6895 };
var SYDNEY = { x: 151.2070, y: 0, z: -33.8675 };
var US = { x: -98.5795, y: 0, z: 39.8282 };
var EQU = { x: -78.4560849, y: 0, z: 0.0005385 };
var GRW = { x: 0, y: 0, z: 0 };
var LON = { x: -0.1821, y: 0, z: 51.1537 };
var NP = { x: 0, y: 0, z: 90 }
var SP = { x: 0, y: 0, z: -90 }

//LOCATIONS = [
//    LAX, NY, TOKYO, SEA, SYDNEY, CHI, LON, SFO, GRW
//];

LOCATIONS = [
    LAX, SEA, SFO, 
];

//LOCATIONS = [
//    LON, GRW
//];


RANGE = 0.1
LOCATION = SEA;
var PLANE_SCALE = 0.4;
var PLANE_RAW_DIMENSIONS = { x: 0.2860, y: 0.1423, z: 0.3405 };
PLANE_DIMENSIONS = Vec3.multiply(PLANE_RAW_DIMENSIONS, PLANE_SCALE);
SCALE = 1 / 2e7;
SCALED_RADIUS = SCALE * GEO.EARTH_RADIUS;
SCALED_DIAMETER = SCALED_RADIUS * 2;
MARKER_SIZE = 5000 * SCALE

FLIGHT_MODELS = {
    lear_big: [
        "SimpleAirport/Models/jet01.fbx",
        "SimpleAirport/Models/jet02.fbx",
        "SimpleAirport/Models/jet03.fbx",
    ],
    lear_small: [
        "SimpleAirport/Models/jet04.fbx",
        "SimpleAirport/Models/jet05.fbx",
    ],
    cessna: [
        "SimpleAirport/Models/small_plane01.fbx",
        "SimpleAirport/Models/small_plane03.fbx",
        "SimpleAirport/Models/small_plane04.fbx",
    ],
    prop: [
        "SimpleAirport/Models/plane_propellor01.fbx"
    ],
    boeing: [
        "SimpleAirport/Models/plane01.fbx",
        "SimpleAirport/Models/plane02.fbx",
        "SimpleAirport/Models/plane03.fbx",
    ],
    helo: [
        
    ],
    unknown: [ "SimpleAirport/Models/small_plane02.fbx" ],
    
}

FLIGHT_MODEL_MAPS = {
    lear_small: [ "CL", "C2", "GLF" ],
    cessna: [ "DV", "C1" ],
    boeing: [ "B73", "A3" ],
    helo: ["R" ]
}

