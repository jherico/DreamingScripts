"use strict";

// 46.5, 48.5   210 km
// 121, 124     230 km
// map is 353 km high 353230 /


knotsToMetersPerSecond = function(knots) {
    return knots * 0.514444;
}

feetToMeters = function(ft) {
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
BEARING = HEADING
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
LONG_FLIGHT_NUMBER = 16


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

FlightRadar.VERTICAL_SCALE = 1 / 5000
FlightRadar.flightToRotation = function(flightData) {
    var bearing = flightData[HEADING];
    var pitch = 0; //45 * flightData[VERTICAL_SPEED] / 2000; 
    return Quat.fromPitchYawRollDegrees(-pitch, bearing, 0);
}


FlightRadar.requestFlightsData = function(lat, lon, latRange, lonRange, callback) {
    var minLat = lat - latRange
    var maxLat = lat + latRange
    var minLon = lon - lonRange
    var maxLon = lon + lonRange
    var url = "https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=" + maxLat + "," + minLat + "," + minLon + "," + maxLon + "&faa=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=7200&gliders=1&stats=1&ems=1";
    //url = "https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=49.45,45.45,-124.3,-120.3&faa=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=7200&gliders=1&stats=1&ems=1";
    print("URL " + url)
    queryUrl(url, callback);
}

FlightRadar.requestFlightDetails = function(flightId, callback) {
    var url = "https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=" + flightId;
    queryUrl(url, callback);
}