"use strict";

// 46.5, 48.5   210 km
// 121, 124     230 km
// map is 353 km high 353230 /


function knotsToMetersPerSecond(knots) {
    return knots * 0.514444;
}

function feetToMeters(ft) {
    return ft * 0.3048;
}

function queryUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            } else {
                console.warn("Status result " + xhr.status)
            }
        } 
    };
    xhr.open('GET', url, true);
    xhr.send('');
}

KM_SCALE = 1 / 10
SCALE = 1 / 10000
VERTICAL_SCALE = 5

FLIGHT_NUMBER = 0
LATITUDE = 1
LONGITUDE = 2
HEADING = 3
ALTITUDE = 4
SPEED = 5
UNKNOWN_1 = 6
RADAR_ID = 7
MODEL = 8
REGISTRATION = 9
UPDATED = 10 // ???
ORIGIN = 11
DEST = 12
SHORT_FLIGHT_NUMBER = 13
UNKNOWN_2 = 14
VERTICAL_SPEED = 15


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

FlightRadar = {};

FlightRadar.latLongAltToVec3 = function(lat, lon, alt) {
    var offsetLat = lat - 46.5;
    var offsetLon = lon - 121;

    // Convert to kilometers
    var x = (offsetLon / 3) * 230 * KM_SCALE;
    var z = (offsetLat / 2) * 210 * KM_SCALE;

    // Convert to scaled meters
    x *= ;
    z *= KM_SCALE;
    x -= 11.5;
    z -= 10.5;
    var y = feetToMeters(alt) / 5000;
    return { x: x, y: y, z: z };
}

FlightRadar.trailToPosition = function(t) {
    return FlightRadar.latLongAltToVec3(t.lat, Math.abs(t.lng), t.alt);
}


FlightRadar.flightToPosition = function(flightData) {
    var alt = flightData[ALTITUDE];
    var lat = flightData[LATITUDE];
    var lon = Math.abs(flightData[LONGITUDE]);
    return FlightRadar.latLongAltToVec3(lat, lon, alt);
}

FlightRadar.flightToRotation = function(flightData) {
    var bearing = flightData[HEADING];
    var pitch = 0; //45 * flightData[VERTICAL_SPEED] / 2000; 
    return Quat.fromPitchYawRollDegrees(-pitch, bearing * -1, 0);
}


FlightRadar.flightToVelocity = function(flightData) {
    var orientation = FlightRadar.flightToRotation(flightData);
    var speed = knotsToMetersPerSecond(flightData[SPEED]);
    var result = Vec3.multiplyQbyV(orientation, {x: 0, y: 0, z:  speed });
    result = Vec3.multiply(result, 1 / 10000);
    result.y = (feetToMeters(flightData[VERTICAL_SPEED]) / 5000) / 60;
    return result;
}

FlightRadar.requestFlightsData = function(callback) {
    var url = "https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=49,46,-125,-120&faa=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=7200&gliders=1&stats=1&ems=1";
    queryUrl(url, callback);
}

FlightRadar.requestFlightDetails = function(flightId, callback) {
    var url = "https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=" + flightId;
    queryUrl(url, callback);
}