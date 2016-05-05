Script.include("./Geo.js");

var SEA = { x: -122.3088, y: 0, z: 47.4502 };
var US = { x: -98.5795, y: 0, z: 39.8282 };
var LAX = { x: -118.4139235, y: 0, z: 33.9411931 };
var EQU = { x: -78.4560849, y: 0, z: 0.0005385 };
var GRW = { x: 0, y: 0, z: 0 };
var LON = { x: -0.1821, y: 0, z: 51.1537 };
var NP = { x: 0, y: 0, z: 90 }
var SP = { x: 0, y: 0, z: -90 }

RANGE = 15
LOCATION = SEA;

var PLANE_SCALE = 0.4;
var PLANE_RAW_DIMENSIONS = { x: 0.2860, y: 0.1423, z: 0.3405 };
PLANE_DIMENSIONS = Vec3.multiply(PLANE_RAW_DIMENSIONS, PLANE_SCALE);

INITIAL_SCALE = 1 / 5e7
INITIAL_SCALED_DIAMETER = INITIAL_SCALE * GEO.EARTH_RADIUS * 2;
SCALE = 1 / 1e5;
SCALED_RADIUS = SCALE * GEO.EARTH_RADIUS;
SCALED_DIAMETER = SCALED_RADIUS * 2;
MARKER_SIZE = 5000 * SCALE

EARTH_ENTITY_NAME = "earth";

FBX_EARTH_PROPERTIES = {
    type: "Model",
    dimensions: { x: INITIAL_SCALED_DIAMETER, y: INITIAL_SCALED_DIAMETER, z: INITIAL_SCALED_DIAMETER },
    position: { x: 0, y: INITIAL_SCALED_DIAMETER, z: 0 },
    modelURL: "https://s3.amazonaws.com/DreamingContent/assets/models/Earth.fbx",
};

LO_RES_EARTH_IMAGE = "earthwgrid.png"
HI_RES_EARTH_IMAGE = "2_no_clouds_16k.jpg"
EARTH_IMAGE = HI_RES_EARTH_IMAGE

SPHERE_EARTH_PROPERTIES = {
    type: "Sphere",
    dimensions: { x: INITIAL_SCALED_DIAMETER, y: INITIAL_SCALED_DIAMETER, z: INITIAL_SCALED_DIAMETER },
    position: { x: 0, y: INITIAL_SCALED_DIAMETER, z: 0 },
    userData: "{\n    \"ProceduralEntity\": {\n        \"version\": 2,\n        \"shaderUrl\": \"https://s3.amazonaws.com/DreamingContent/shaders/globeMap.fs\",\n        \"channels\": [ \"https://s3.amazonaws.com/DreamingContent/assets/images/" + EARTH_IMAGE + "\" ]  \n    }\n}"
};

EARTH_PROPERTIES = SPHERE_EARTH_PROPERTIES;


