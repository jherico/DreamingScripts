// #debug

"use strict";

Script.include("./Austin.js");
Script.include("./FlightRadar.js");
Script.include("./Geo.js");
Script.include("./FlightConstants.js")
Script.include("./GoogleMaps.js");
Script.include("./Earth.js")

var earthCache = AUSTIN.Earth.prefetch();

debugger;

AUSTIN.Radar = function() {
    this.flights = {};
    this.ENTITY_NAME = "plane";
    this.lat = LOCATION.z
    this.lon = LOCATION.x
    this.geoMapper = new GEO.Mapper({
        lat: this.lat,
        lon: this.lon,
        scale: SCALE,
    });
    this.map = new Google.Map({
        center: LOCATION,
        lat: this.lat,
        lon: this.lon,
        range: RANGE,
        geoMapper: this.geoMapper,
    });
    this.wipe(true);

    this.earth = new AUSTIN.Earth();
    this.earth.build();
    this.earth.setScale(SCALE);
    this.earth.setPosition({ x: 0, y: this.earth.radius * -1, z: 0});
    this.earth.animate();
    this.locationIndex = 0;
    this.nextLocation();
    
    var self = this;

    this.scanner = new AUSTIN.Updater(2, function(delta){
        self.updatePlanesRaw(delta);
    });

    return this;
}

AUSTIN.Radar.prototype = {
    nextLocation: function() {
        var location = LOCATIONS[this.locationIndex];
        var lat = this.lat = location.z
        var lon = this.lon = location.x
        this.earth.setRotation(AUSTIN.Earth.topRotation(lat, lon));
        this.locationIndex = (this.locationIndex + 1) % LOCATIONS.length;
        var self = this;
        var postAnimateCallback = function() {
            console.log("Foo1");
            self.earth.showMarker(lat, lon, 2.5);
            console.log("Foo2");
            //self.scanner.start();
            Script.setTimeout(function(){
                self.earth.clearMarker();
                self.nextLocation();
                self.scanner.stop();
            }, 2 * 1000);
        };
        this.earth.animate({
            callback: postAnimateCallback,
            
        });
    },
    
    wipe: function(wipeEarth) {
        this.map.wipe();

        var that = this;
        Entities.findEntities({ x: 0, y: 0, z: 0 }, 50).forEach(function(id) {
            var properties = Entities.getEntityProperties(id);

            if (properties.name === that.ENTITY_NAME) {
                Entities.deleteEntity(id);
                return;
            }
        });
    },

/*    
    updateEarth: function(deltaTime) {
        if (this.animation) {
            if (this.animation.expired()) {
                this.rotator.stop();
                if (RANGE <= 1) {
                    this.map.buildMap();
                }
//                this.updatePlanesRaw();
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
*/

    getFlightEntityProperties: function(flightId, flight, isNewFlight) {
        var alt = flight[ALTITUDE];
        var lat = flight[LATITUDE];
        var lon = flight[LONGITUDE];
        var speed = flight[SPEED];
        var vertical_speed = flight[VERTICAL_SPEED];
        var bearing = flight[HEADING];
        var updated = flight[UPDATED];
        

        var now = (new Date().getTime() / 1000) + this.epochOffset;
        // age in seconds
        var age = now - updated;
        var rot = this.earth.relativeOrientation(lat, lon, bearing);
        // Velocity vector
        var vel = {x: 0, y: vertical_speed, z: speed };
        // Rotate by the orientation
        vel = Vec3.multiplyQbyV(rot, vel);
        // Scale by our earth size
        vel = Vec3.multiply(vel, this.earth.scale);
        var pos = this.earth.relativePosition(lat, lon, alt);
        pos = Vec3.sum(pos, Vec3.multiply(vel, age));
        //console.log("Flight pos " + AUSTIN.vec3toStr(pos));

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
                parentID: this.earth.id,
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

        
        if (!this.planes) {
            this.planes = {};
        }
        
        var newPlane = false;
        var latestUpdated = 0;
        for (var i = 0; i < updateFlightIds.length; ++i) {
            var flightId = updateFlightIds[i];
            var flight = updateData[flightId];
            latestUpdated = Math.max(flight[UPDATED], latestUpdated);
            var plane = flight[MODEL];
            if (!this.planes[plane]) {
                newPlane = true;
                this.planes[plane] = true;
            }
        }

        if (newPlane) {
            console.log("Plane types " + Object.keys(this.planes));
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
            flight = AUSTIN.FlightRadar.flightToSI(flight);
            if (!this.validFlight(flightId, updateData)) {
                continue;
            }
            this.updateFlight(flightId, updateData[flightId]);
        }
    },
    
    updatePlanesRaw: function() {
        var that = this;
        AUSTIN.FlightRadar.requestFlightsData(this.lat, this.lon, RANGE, RANGE, function(results){
            AUSTIN.FlightRadar.IGNORED_KEYS.forEach(function(key){ delete results[key]; }, this);
            that.updatePlanes(results);
        });
    },
};

Script.setTimeout(function(){
    var radar = new AUSTIN.Radar();
}, 1000);
