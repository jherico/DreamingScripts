"use strict";

Script.include("./Austin.js");
Script.include("./FlightRadar.js");
Script.include("./Geo.js");
Script.include("./FlightConstants.js")
Script.include("./GoogleMaps.js");
Script.include("../assets/simple/models.js")


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
    this.map = new Google.Map({
        center: LOCATION,
        lat: LOCATION.z,
        lon: LOCATION.x,
        range: RANGE,
        geoMapper: this.geoMapper,
    });
    this.map.wipe();
    this.wipe(true);
    this.earth = Entities.addEntity(EARTH_PROPERTIES);
    
    Entities.editEntity(this.earth, {
        name: EARTH_ENTITY_NAME,
    });


    var pos = this.geoMapper.positionToVec3(this.lat, this.lon, 0);
    console.log("Sphere pos " + AUSTIN.vec3toStr(pos));
    Entities.addEntity({
        type: "Sphere",
        localPosition: pos,
        dimensions: { x: MARKER_SIZE, y: MARKER_SIZE, z: MARKER_SIZE },
        color: { red: 255, green: 0, blue: 0 },
        ignoreCollisions: true,
        dynamic: false,
        parentID: this.earth,
        name: EARTH_ENTITY_NAME,
    });
    
    var that = this;
    this.rotator = new AUSTIN.Updater(0.05, function(delta){
        that.updateEarth(delta);
    });
    this.scanner = new AUSTIN.Updater(2, function(delta){
        that.updatePlanesRaw(delta);
    });

    this.animate(this.geoMapper.rotation);
    return this;
}

AUSTIN.Radar.prototype = {
    wipe: function(wipeEarth) {
        var that = this;
        Entities.findEntities({ x: 0, y: 0, z: 0 }, 50).forEach(function(id) {
            var properties = Entities.getEntityProperties(id);
            if (wipeEarth && properties.name === EARTH_ENTITY_NAME) {
                Entities.deleteEntity(id);
                return;    
            }

            if (properties.name === that.ENTITY_NAME) {
                Entities.deleteEntity(id);
                return;
            }
        });
    },
    
    updateEarth: function(deltaTime) {
        if (this.animation) {
            if (this.animation.expired()) {
                this.rotator.stop();
                if (RANGE <= 1) {
                    this.map.buildMap();
                }
                this.updatePlanesRaw();
                this.scanner.start();
                Entities.editEntity(this.earth, {
                    dimensions: { x: SCALED_DIAMETER, y: SCALED_DIAMETER, z: SCALED_DIAMETER },
                    position: this.geoMapper.rotatedCenter,
                    rotation: this.geoMapper.rotation,
                });
            } else if (this.animation.ready()) {
                var alpha = this.animation.easingValue();
                var pos = Vec3.mix(EARTH_PROPERTIES.position, this.geoMapper.rotatedCenter, alpha);
                console.log("Easing Value " + alpha);
                var rot = this.animation.interpolatedValue();
                var dimension = ((SCALED_DIAMETER - INITIAL_SCALED_DIAMETER) * alpha) + INITIAL_SCALED_DIAMETER;
                
                Entities.editEntity(this.earth, {
                    dimensions: { x: dimension, y: dimension, z: dimension },
                    position: pos,
                    rotation: rot,
                    name: EARTH_ENTITY_NAME,
                });
            }
        }
    },

    animate: function(rot) {
        this.wipe(false);
        this.animation = new AUSTIN.Easing({
            type: 'easeInOutQuad',
            duration: 6.0,
            begin: { x: 0, y: 0, z: 0, w: 1 },
            end: rot,
            interpolate: Quat.slerp,
        });
        this.rotator.start();
    },

    
    getFlightEntityProperties: function(flightId, flight, isNewFlight) {
        var alt = flight[ALTITUDE];
        var lat = flight[LATITUDE];
        var lon = flight[LONGITUDE];
        var speed = flight[SPEED] * this.geoMapper.scale;
        var vertical_speed = flight[VERTICAL_SPEED] *  this.geoMapper.scale;
        var bearing = flight[HEADING];
        var updated = flight[UPDATED];

        var now = (new Date().getTime() / 1000) + this.epochOffset;
        // age in seconds
        var age = now - updated;
        var rot = this.geoMapper.bearingToQuat(lat, lon, bearing + 180);
        var vel = Vec3.multiplyQbyV(rot, {x: 0, y: vertical_speed, z: speed });
        var posOffset = Vec3.multiply(vel, age);
        var pos = this.geoMapper.positionToVec3(lat, lon, alt);
        pos = Vec3.sum(pos, posOffset);
        

        if (isNewFlight) {
            return {
                type: "Model",
                name: this.ENTITY_NAME,
                modelURL: "https://s3.amazonaws.com/DreamingContent/assets/simple/SimpleAirport/Models/jet01.fbx",
                visible: true,
                lifetime: 600,
                damping: 0,
                dimensions: PLANE_DIMENSIONS,
                userData: JSON.stringify({
                    flight: {
                        id: flightId,
                        data: flight,
                    }
                }),
                parentID: this.earth,
                registrationPoint: { x: 0.5, y: 0, z: 0.5 },
                localPosition: pos,
                localRotation: rot,
                velocity: vel,
            };
        } else {
            return {
            	lifetime: 600,
                localPosition: pos,
                localRotation: rot,
                velocity: vel,
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
        //var properties = Entities.getEntityProperties(newFlight.entity);
        //console.log(JSON.stringify(properties));
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

        //console.log("Removed " + flightId);
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
    
    updatePlanes: function(updateData) {
        var updateFlightIds = Object.keys(updateData);

        var latestUpdated = 0;
        for (var i = 0; i < updateFlightIds.length; ++i) {
            var flightId = updateFlightIds[i];
            var flight = updateData[flightId];
            latestUpdated = Math.max(flight[UPDATED], latestUpdated);
        }
        this.latestUpdated = latestUpdated;
        var now = (new Date().getTime() / 1000);
        var delta = now - latestUpdated;
        if ((!this.epochOffset) || (delta < this.epochOffset)) {
            this.epochOffset = delta;
            console.log("New offset is " + this.epochOffset);
        }
        
        var that = this;
        this.trim(updateData);
        var updateFlightIds = Object.keys(updateData);
        for (var i = 0; i < updateFlightIds.length; ++i) {
            var flightId = updateFlightIds[i];
            var flight = updateData[flightId];
            flight = FlightRadar.flightToSI(flight);
            if (!this.validFlight(flightId, updateData)) {
                continue;
            }
            this.updateFlight(flightId, updateData[flightId]);
        }
    },
    
    updatePlanesRaw: function() {
        var that = this;
        FlightRadar.requestFlightsData(this.lat, this.lon, RANGE, RANGE, function(results){
            FlightRadar.IGNORED_KEYS.forEach(function(key){ delete results[key]; }, this);
            that.updatePlanes(results);
        });
    },
};

var radar = new AUSTIN.Radar();
//radar.updateRaw();
//AUSTIN.updateEvery(2, function(){
//    radar.updateRaw();
//})

