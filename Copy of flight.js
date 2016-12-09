"use strict";

Script.include("./Austin.js");

// https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=47.76,47.17,-122.92,-121.47&faa=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=7200&gliders=1&stats=1&selected=98341af&ems=1
//https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=48.5,46.5,-124,-121&faa=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=7200&gliders=1&stats=1&ems=1

var FLIGHT_NUMBER = 0
var LATITUDE = 1
var LONGITUDE = 2
var HEADING = 3
var ALTITUDE = 4
var SPEED = 5
var UNKNOWN_1 = 6
var RADAR_ID = 7
var MODEL = 8
var REGISTRATION = 9
var UPDATED = 10 // ???
var ORIGIN = 11
var DEST = 12
var SHORT_FLIGHT_NUMBER = 13
var UNKNOWN_2 = 14
var UNKNOWN_3 = 15


//[04/24 11:04:25] [DEBUG]     "A735D7",
//[04/24 11:04:25] [DEBUG]     47.5236,
//[04/24 11:04:25] [DEBUG]     -122.4573,
//[04/24 11:04:25] [DEBUG]     290,
//[04/24 11:04:25] [DEBUG]     5563,
//[04/24 11:04:25] [DEBUG]     248,
//[04/24 11:04:25] [DEBUG]     "6347",
//[04/24 11:04:25] [DEBUG]     "T-MLAT2",
//[04/24 11:04:25] [DEBUG]     "B738",
//[04/24 11:04:25] [DEBUG]     "N564AS",
//[04/24 11:04:25] [DEBUG]     1461521056,
//[04/24 11:04:25] [DEBUG]     "OAK",
//[04/24 11:04:25] [DEBUG]     "SEA",
//[04/24 11:04:25] [DEBUG]     "AS353",
//[04/24 11:04:25] [DEBUG]     0,
//[04/24 11:04:25] [DEBUG]     -640,
//[04/24 11:04:25] [DEBUG]     "ASA353",
//[04/24 11:04:25] [DEBUG]     0

function knotsToMPS(knots) {
    return knots * 0.514444;
}

function feetToMeters(ft) {
    return ft * 0.3048;
}
 
var IGNORED_KEYS = {
    version: true,
    stats: true,
    "selected-aircraft": true,  
}

vec3toStr = function(v, digits) {
    if (!digits) { digits = 3; }
    return "{ " + v.x.toFixed(digits) + ", " + v.y.toFixed(digits) + ", " + v.z.toFixed(digits)+ " }";
}

function flightToPosition(flight) {
    //console.log("Flight " + flight);
    var altitude = feetToMeters(flight[ALTITUDE]);
    var lat = flight[LATITUDE];
    var lon = Math.abs(flight[LONGITUDE]);
    var offsetLat = lat - 46.5;
    var offsetLon = lon - 121;
    //console.log("Lat,Lon " + lat + "," + lon);
    
    // Convert to kilometers
    var x = (offsetLon / 3) * 230;
    var z = (offsetLat / 2) * 210;
    // Convert to scaled meters
    x /= 10;
    z /= 10;
    x -= 11.5;
    z -= 10.5;
    var y = altitude / 1000;
    var result = { x: x, y: y, z: z };
    print(vec3toStr(result));
    return result;
}

function flightToRotation(flight) {
    var bearing = flight[HEADING];
    return Quat.fromPitchYawRollDegrees(0, bearing, 0);
}

 // 46.5, 48.5   210 km
 // 121, 124     230 km
  // map is 353 km high 353230 /

var TEST_ENTITY_NAME = "plane";

FlightRadar = {
    flights: {},

    wipe: function() {
        Entities.findEntities({ x: 0, y: 0, z: 0 }, 50).forEach(function(id) {
            var properties = Entities.getEntityProperties(id);
            if (properties.name != TEST_ENTITY_NAME) {
                return;
            }
            Entities.deleteEntity(id);
        });
    }, 

    add: function(flightId, flight) {
        var newFlight = {
            id: flightId, 
            raw: flight,
            overlay: null,
            entity: null,
        };
        this.flights[flightId] = newFlight;
        var position = flightToPosition(flight);
        var rotation = flightToRotation(flight); 
//        newFlight.overlay = new AUSTIN.Overlay("sphere", {
//            solid: true, visible: true,
//            position: position,
//            dimensions: { x: 0.2, y: 0.2, z: 0.2 },
//            color: AUSTIN.randomColor(),
//        });
        
        newFlight.entity = Entities.addEntity({
            type: "Model",
            name: TEST_ENTITY_NAME,
            modelURL: "https://s3.amazonaws.com/DreamingContent/assets/simple/SimpleAirport/Models/jet05.fbx",
            position: position,
            rotation: rotation,
            visible: true,
            userData: JSON.stringify(flight),
        });
    },
    
    updateFlight: function(flightId, flight) {
        var updateFlight = this.flights[flightId];
        updateFlight.raw = flight;
        //https://www.google.com/maps/@47.5,-122.5,8z
        var newPosition = flightToPosition(flight);
        var rotation = flightToRotation(flight); 
//        updateFlight.overlay.edit({
//            position: newPosition,
//        });
        Entities.editEntity(updateFlight.entity, {
            position: newPosition,
            rotation: rotation,
            userData: JSON.stringify(flight),
        });
    },
    
    destroy: function(flightId) {
        var deadFlight = this.flights[flightId];
        deadFlight.overlay.destroy();
        delete this.flights[flightId];
    },
    
    trim: function(updateData) {
        var currentFlightIds = Object.keys(this.flights); 
        currentFlightIds.forEach(function(flightId) {
            var flight  = this.flights[flightId];
            if (!(flightId in updateData)) {
                this.destroy(flightId);
            }
        });
    },
    
    update: function(updateData) {
        //this.trim(updateData);
        var updateFlightIds = Object.keys(updateData);
        updateFlightIds.forEach(function(flightId){
            if (flightId in IGNORED_KEYS) {
                return;
            }
            var flight = updateData[flightId];
            if (!(flightId in this.flights)) {
                this.add(flightId, flight);
            } else {
                this.updateFlight(flightId, flight);
            }
        }, this);
    },
    
    updateRaw: function() {
        var url = "https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=48.5,46.5,-124,-121&faa=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=7200&gliders=1&stats=1&ems=1";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    FlightRadar.update(JSON.parse(xhr.responseText));
                } else {
                    console.warn("Status result " + xhr.status)
                }
            } 
        };
        xhr.open('GET', url, true);
        xhr.send('');
    }
}

FlightRadar.wipe();

AUSTIN.updateEvery(1, function(){
    FlightRadar.updateRaw();
})

