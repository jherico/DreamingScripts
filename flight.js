"use strict";

Script.include("./Austin.js");
Script.include("./FlightRadar.js");
Script.include("./GoogleMaps.js")

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

var SEA = { x: -122.3, y: 0, z: 47.45 };
var LAX = { x: -118.4139235, y: 0, z: 33.9411931 };
var EQU = { x: -78.4560849, y: 0, z: 0.0005385 };

var LOCATION = SEA;

var map = new Google.Map({
    center: LOCATION,
});
map.wipe();
//map.buildMap();



var IGNORED_KEYS = ['version', 'stats', 'selected-aircraft', 'full_count' ];

AUSTIN.Radar = function() {
    this.flights = {};
    this.ENTITY_NAME = "plane";
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

    addFlight: function(flightId, flight) {
        console.log("Adding flight " + flightId);
        var newFlight = {
            id: flightId, 
            raw: flight,
            entity: null,
        };
        this.flights[flightId] = newFlight;
        var newFlightPos = this.flightToPosition(flight);
        console.log("New flight pos " + vec3toStr(newFlightPos))
        newFlight.entity = Entities.addEntity({
            type: "Model",
            name: this.ENTITY_NAME,
            modelURL: "https://s3.amazonaws.com/DreamingContent/assets/simple/SimpleAirport/Models/jet05.fbx",
            position: this.flightToPosition(flight),
            rotation: this.flightToRotation(flight),
            velocity: this.flightToVelocity(flight),
            visible: true,
            lifetime: 3600,
            damping: 0,
            userData: JSON.stringify({
                flight: {
                    id: flightId,
                    data: flight,
                }
            }),
        });
        console.log("FLIGHT Added");
    },
    
    updateFlight: function(flightId, flight) {
        if (!(flightId in this.flights)) {
            console.log("Adding flight");
            this.addFlight(flightId, flight);
            return;
        }

        var updateFlight = this.flights[flightId];
        if (flight[UPDATED] > updateFlight.raw[UPDATED]) {
            updateFlight.raw = flight;
            Entities.editEntity(updateFlight.entity, {
                position: this.flightToPosition(flight),
                rotation: this.flightToRotation(flight),
                velocity: this.flightToVelocity(flight),
            });
        }
    },
    
    remove: function(flightId) {
        console.log("Requested removal of " + flightId);
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
        FlightRadar.requestFlightsData(function(results){
            IGNORED_KEYS.forEach(function(key){ delete results[key]; }, this);
            that.update(results);
        });
    },
    

    latLongAltToVec3: function(lat, lon, alt) {
        var offsetLat = lat - 46.5;
        var offsetLon = lon - 121;

        // Convert to kilometers
        var x = (offsetLon / 3) * 230 * KM_SCALE;
        var z = (offsetLat / 2) * 210 * KM_SCALE;

        // Convert to scaled meters
        x -= 11.5;
        z -= 10.5;
        var y = feetToMeters(alt) / 5000;
        return { x: x, y: y, z: z };
    },

    trailToPosition: function(t) {
        return latLongAltToVec3(t.lat, Math.abs(t.lng), t.alt);
    },


    flightToPosition: function(flightData) {
        var alt = flightData[ALTITUDE];
        var lat = flightData[LATITUDE];
        var lon = flightData[LONGITUDE];
        var result = map.latLongToPosition({ x: lon, y: 0, z: lat });
        result.y = feetToMeters(alt) / 5000;
        console.log("CCC " + alt + " " + vec3toStr(result))
        return result;
    },
    
    flightToRotation: function(flightData) {
        return FlightRadar.flightToRotation(flightData);
    },

    flightToVelocity: function(flightData) {
        var orientation = FlightRadar.flightToRotation(flightData);
        var speed = knotsToMetersPerSecond(flightData[SPEED]);
        var result = Vec3.multiplyQbyV(orientation, {x: 0, y: 0, z:  speed });
        result = Vec3.multiply(result, 1 / 10000);
        //result.y = (feetToMeters(flightData[VERTICAL_SPEED]) * FlightRadar.VERTICAL_SCALE);
        return result;
    },
};

var radar = new AUSTIN.Radar();
radar.wipe();
AUSTIN.updateEvery(1, function(){
    radar.updateRaw();
})

