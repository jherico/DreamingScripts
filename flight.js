"use strict";

Script.include("./Austin.js");
Script.include("./FlightRadar.js");
Script.include("./GoogleMaps.js");
Script.include("./Geo.js");

function feetToMeters(ft) {
    return ft * 0.3048;
}

console = {
  log: function(str) {
      print("FLIGHT " + str);
  },
  warn: function(str) {
      print("FLIGHT " + str);
  },
  debug: function(str) {
      print("FLIGHT " + str);
  },
};

vec3toStr = function(v, digits) {
    if (!digits) { digits = 3; }
    return "{ " + v.x.toFixed(digits) + ", " + v.y.toFixed(digits) + ", " + v.z.toFixed(digits)+ " }";
}

var SEA = { x: -122.3088, y: 0, z: 47.4502 };
var US = { x: -98.5795, y: 0, z: 39.8282 };
var LAX = { x: -118.4139235, y: 0, z: 33.9411931 };
var EQU = { x: -78.4560849, y: 0, z: 0.0005385 };
var GRW = { x: 0, y: 0, z: 0 };
var RANGE = 2
var LOCATION = SEA;
var EARTH_ENTITY;
var EARTH_RADIUS = 6.371e6
var SCALE = 1 / 200000;
var SCALED_RADIUS = EARTH_RADIUS * SCALE;
console.log("Scaled radius " + SCALED_RADIUS);
var EARTH_PROPERTIES = {
    "type": "Sphere",
    "dimensions": { "x": SCALED_RADIUS, "y": SCALED_RADIUS, "z": SCALED_RADIUS },
    "userData": "{\n    \"ProceduralEntity\": {\n        \"version\": 2,\n        \"shaderUrl\": \"https://s3.amazonaws.com/DreamingContent/shaders/sphereMap.fs\",\n        \"channels\": [ \"https://s3.amazonaws.com/DreamingContent/assets/images/2_no_clouds_16k.jpg\" ]  \n    }\n}"
};


var IGNORED_KEYS = ['version', 'stats', 'selected-aircraft', 'full_count' ];

AUSTIN.Radar = function() {
    this.flights = {};
    this.ENTITY_NAME = "plane";
    this.lat = LOCATION.z
    this.lon = LOCATION.x
    this.geoMapper = new GEO.Mapper({
        lat: LOCATION.z,
        lon: LOCATION.x,
        scale: SCALE,
    });
    
    EARTH_ENTITY = Entities.addEntity(EARTH_PROPERTIES);
    Entities.editEntity(EARTH_ENTITY, {
        position: Vec3.multiply(this.geoMapper.rotatedCenter, -1 * this.geoMapper.scale),
        rotation: this.geoMapper.rotation,
    });
    return this;
}

AUSTIN.Radar.prototype = {
    wipe: function() {
        var that = this;
        Entities.findEntities({ x: 0, y: 0, z: 0 }, 50).forEach(function(id) {
            var properties = Entities.getEntityProperties(id);
            if (properties.name != that.ENTITY_NAME) {
                return;
            }
            Entities.deleteEntity(id);
        });
    },
    
    getFlightEntityProperties: function(flightId, flight, isNewFlight) {
        var pos = this.flightToPosition(flight);
        var rot = this.flightToRotation(pos, flight);
        if (isNewFlight) {
            return {
                type: "Model",
                name: this.ENTITY_NAME,
                modelURL: "https://s3.amazonaws.com/DreamingContent/assets/simple/SimpleAirport/Models/jet05.fbx",
                visible: true,
                lifetime: 600,
                damping: 0,
                userData: JSON.stringify({
                    flight: {
                        id: flightId,
                        data: flight,
                    }
                }),
                parentID: EARTH_ENTITY,
                localPosition: pos,
                rotation: rot,
                //velocity: this.flightToVelocity(flight),
            };
        } else {
            return {
            	lifetime: 600,
                localPosition: pos,
                rotation: rot,
                //velocity: this.flightToVelocity(flight),
            };
        }
    },

    addFlight: function(flightId, flight) {
        var newFlight = {
            id: flightId, 
            raw: flight,
            entity: null,
        };
        this.flights[flightId] = newFlight;
        var props = this.getFlightEntityProperties(flightId, flight, true);
        newFlight.entity = Entities.addEntity(props);
    },
    
    updateFlight: function(flightId, flight) {
        if (!(flightId in this.flights)) {
            this.addFlight(flightId, flight);
            return;
        }

        var updateFlight = this.flights[flightId];
        if (flight[UPDATED] > updateFlight.raw[UPDATED]) {
            updateFlight.raw = flight;
            var updateProps = this.getFlightEntityProperties(flightId, flight, false);
            Entities.editEntity(updateFlight.entity, updateProps);
        }
    },
    
    remove: function(flightId) {
        if (!(flightId in this.flights)) {
            return;
        }

        console.log("Removed " + flightId);
        var deadFlight = this.flights[flightId];
        Entities.deleteEntity(deadFlight.entity);
        delete this.flights[flightId];
    },
    
    validFlight: function(flightId, updateData) {
        if (!(flightId in updateData)) {
            //console.log(flightId + " invalid, no update data");
            return false;
        }
        
        var flight = updateData[flightId];
        if ((flight[ALTITUDE] < 20) || (flight[SPEED] < 20)) {
            //console.log(flightId + " invalid, not moving or not in air");
            return false;
        }

        return true;
    },
    
    trim: function(updateData) {
        var currentFlightIds = Object.keys(this.flights);
        currentFlightIds.forEach(function(flightId) {
            if (!this.validFlight(flightId, updateData)) {
                this.remove(flightId);
            }
        }, this);
    },
    
    update: function(updateData) {
        var that = this;
        this.trim(updateData);
        var updateFlightIds = Object.keys(updateData);
        for (var i = 0; i < updateFlightIds.length; ++i) {
            var flightId = updateFlightIds[i];
            if (!this.validFlight(flightId, updateData)) {
                continue;
            }
            this.updateFlight(flightId, updateData[flightId]);
        }
    },
    
    updateRaw: function() {
        var that = this;
        FlightRadar.requestFlightsData(LOCATION.z, LOCATION.x, RANGE, RANGE, function(results){
            IGNORED_KEYS.forEach(function(key){ delete results[key]; }, this);
            that.update(results);
        });
    },
    
    flightToPosition: function(flightData) {
        var alt = flightData[ALTITUDE];
        var lat = flightData[LATITUDE];
        var lon = flightData[LONGITUDE];
        return this.geoMapper.toVec3(lat, lon, feetToMeters(alt));
    },
    
    flightToRotation: function(position, flight) {
        var lat = flight[LATITUDE];
        var lon = flight[LONGITUDE];
        var bearing = flight[HEADING];
        //return { x: 0, y: 0, z: 0, w: 1 };
        return this.geoMapper.bearingToQuat(lat, lon, bearing);    
    },

    flightToVelocity: function(flightData) {
        var orientation = FlightRadar.flightToRotation(flightData);
        var speed = knotsToMetersPerSecond(flightData[SPEED]);
        var result = Vec3.multiplyQbyV(orientation, {x: 0, y: 0, z: speed });
        this.geoMapper.fixVelocity(result);
        result = Vec3.multiply(result, 1 / 10000);
        
        return result;
    },
};

var radar = new AUSTIN.Radar();
radar.wipe();
radar.updateRaw();
AUSTIN.updateEvery(30, function(){
    radar.updateRaw();
})

