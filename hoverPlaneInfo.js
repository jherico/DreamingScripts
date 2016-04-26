"use strict";

Script.include("./Austin.js");
Script.include("./FlightRadar.js");

var orientation = MyAvatar.orientation;
orientation = Quat.safeEulerAngles(orientation);
orientation.x = 0;
orientation = Quat.fromVec3Degrees(orientation);
var center = Vec3.sum(MyAvatar.getHeadPosition(), Vec3.multiply(9, Quat.getFront(orientation)));
center.x = Math.floor(center.x * 4) / 4;
center.z = Math.floor(center.z * 4) / 4;
center.y -= 2;
var UPDATE_TIME = 100;
var overlayLine = null;

var TIME_TILL_HIDE = 100;
Script.scriptEnding.connect(cleanup);
var intersectedWithPlane = null;
var intersectionPos = { x: 0, y: 0, z: 0 };
var textMargin = .05;
var textWidth = 1;
var textHeight = .4
var infoPanelProps = {
    position: center,
    dimensions: {
        x: textWidth,
        y: textHeight
    },
    backgroundColor: {
        red: 100,
        green: 0,
        blue: 100
    },
    color: {
        red: 200,
        green: 10,
        blue: 10
    },
    alpha: 0.9,
    lineHeight: .1,
    backgroundAlpha: 0.5,
    ignoreRayIntersection: true,
    visible: false,
    isFacingAvatar: true
}

var infoPanel = Overlays.addOverlay("text3d", infoPanelProps);

function update() {
     castRay();
}

var NEAREST_PLANE;

function findClosestPlane() {
    var position = Camera.position;
    var ray = Quat.getFront(Camera.orientation);
    var nearest;
    var minAngle = 1000;
    Entities.findEntities({
        x: 0,
        y: 0,
        z: 0
    }, 50).forEach(function(id) {
        var properties = Entities.getEntityProperties(id);
        if (properties.name != "plane") {
            return;
        }
        var entityRay = Vec3.normalize(Vec3.subtract(properties.position, position));
        var angle = Math.abs(Math.acos(Vec3.dot(ray, entityRay)));
        if (angle < minAngle) {
            minAngle = angle;
            nearest = properties;
        }
    });
    return nearest;
};

function castRay() {
    var intersection = findClosestPlane();
    if (intersection.id != intersectedWithPlane) {
        // move text up
        intersectedWithPlane = intersection.id;
        intersectionPos = intersection.position;
        var position = Vec3.sum(intersection.position, {
            x: 0,
            y: intersection.dimensions.y * 2,
            z: 0
        });
        showPlaneInfo(position, JSON.parse(intersection.userData));
    }
}

var OVERLAYS = [];

function parseTrackResults(results) {
    OVERLAYS.forEach(function(overlay){
        overlay.destroy();
    }, this);
    OVERLAYS = [];
    if (results.trail && results.trail.length > 1) {
        console.log("Trail found ");
        var lastPos = intersectionPos;
        for (var i = 0; i < results.trail.length; ++i) {
            var newPos = FlightRadar.trailToPosition(results.trail[i]);
//            console.log(newPos.x + " , " + newPos.y + " , " + newPos.z);
//            var overlay = new AUSTIN.Overlay("sphere", {
//                solid: true, visible: true,
//                position: newPos,
//                dimensions: { 0.1, 0.1, 0.1 },
//                color: AUSTIN.Colors.OffWhite,
//            });
//            OVERLAYS.push(overlay);
//            console.log("Segment " + i);
            OVERLAYS.push(new AUSTIN.Overlay("line3d", {
                start: lastPos,
                end: newPos,
                color: AUSTIN.Colors.TronBlue,
                visible: true,
                alpha: 1,
                lineWidth: 5,
            }));
            lastPos = newPos;
        }
    }
    
}

function updateTrack(flight) {
    var flightId = flight.id;
    var url = "https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=" + flightId;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                parseTrackResults(JSON.parse(xhr.responseText));
            } else {
                console.warn("Status result " + xhr.status)
            }
        } 
    };
    xhr.open('GET', url, true);
    xhr.send('');
}

function showPlaneInfo(position, userData) {
    print("USER DATA " + JSON.stringify(userData));
    var flight = userData.flight;
    var flightData = flight.data;
    var flightId = flight.id;
    var flightNum = flightData[SHORT_FLIGHT_NUMBER];
    if (flightNum.length === 0) {
        flightNum = "Classified";
    }
    var registration = flightData[MODEL];
    if (registration.length === 0) {
        registration = "Classified";
    }
    Overlays.editOverlay(infoPanel, {
        visible: true,
        position: position,
        text: flightNum + "\n" + registration
    });
    updateTrack(flight);
}





function overlayLineOn(closePoint, farPoint) {
    var LINE_COLOR = {
        red: 200,
        green: 10,
        blue: 10
    };
    if (overlayLine === null) {
        var lineProperties = {
            lineWidth: 5,
            start: closePoint,
            end: farPoint,
            color: LINE_COLOR,
            ignoreRayIntersection: true, // always ignore this
            visible: true,
            alpha: 1
        };
        overlayLine = Overlays.addOverlay("line3d", lineProperties);

    } else {
        var success = Overlays.editOverlay(this.overlayLine, {
            lineWidth: 5,
            start: closePoint,
            end: farPoint,
            color: LINE_COLOR,
            visible: true,
            ignoreRayIntersection: true, // always ignore this
            alpha: 1
        });
    }
};

function cleanup() {
    Overlays.deleteOverlay(infoPanel);
    Overlays.deleteOverlay(overlayLine);
    Script.clearInterval(updateInterval);
}

var updateInterval = Script.setInterval(update, UPDATE_TIME);
