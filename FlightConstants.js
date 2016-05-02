Script.include("./Geo.js");

var SEA = { x: -122.3088, y: 0, z: 47.4502 };
var US = { x: -98.5795, y: 0, z: 39.8282 };
var LAX = { x: -118.4139235, y: 0, z: 33.9411931 };
var EQU = { x: -78.4560849, y: 0, z: 0.0005385 };
var GRW = { x: 0, y: 0, z: 0 };
var LON = { x: 0.1821, y: 0, z: 51.1537 };
var NP = { x: 0, y: 0, z: 90 }
var SP = { x: 0, y: 0, z: -90 }

RANGE = 1
LOCATION = SEA;

var PLANE_SCALE = 0.4;
var PLANE_RAW_DIMENSIONS = { x: 0.2860, y: 0.1423, z: 0.3405 };
PLANE_DIMENSIONS = Vec3.multiply(PLANE_RAW_DIMENSIONS, PLANE_SCALE);

SCALE = 1 / 50000;
SCALED_DIAMETER = SCALE * GEO.EARTH_RADIUS * 1.999;

EARTH_ENTITY_NAME = "earth";
EARTH_PROPERTIES = {
    type: "Sphere",
    dimensions: { x: SCALED_DIAMETER, y: SCALED_DIAMETER, z: SCALED_DIAMETER },
    userData: "{\n    \"ProceduralEntity\": {\n        \"version\": 2,\n        \"shaderUrl\": \"https://s3.amazonaws.com/DreamingContent/shaders/sphereMap.fs\",\n        \"channels\": [ \"https://s3.amazonaws.com/DreamingContent/assets/images/2_no_clouds_16k.jpg\" ]  \n    }\n}"
};
