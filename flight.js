"use strict";

Script.include("./Austin.js");
Script.include("./FlightRadar.js");
Script.include("./Geo.js");
Script.include("./FlightConstants.js")
Script.include("./GoogleMaps.js");


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
    this.map.buildMap();

    this.wipe(true);
    //this.earth = Entities.addEntity(EARTH_PROPERTIES);
    //Entities.editEntity(this.earth, {
    //    position: this.geoMapper.rotatedCenter,
    //    rotation: this.geoMapper.rotation,
    //    name: EARTH_ENTITY_NAME,
    //});
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
        var rot = this.geoMapper.bearingToRelativeQuat(lat, lon, bearing + 180);
        var vel = Vec3.multiplyQbyV(rot, {x: 0, y: vertical_speed, z: speed });
        var posOffset = Vec3.multiply(vel, age);
        //console.log("Speed " + AUSTIN.vec3toStr(vel) + " offset " + this.epochOffset + " age " + age + " position offset " + AUSTIN.vec3toStr(posOffset));
        var pos = this.geoMapper.positionToRelativeVec3(lat, lon, alt);
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
        var updateFlightIds = Object.keys(updateData);
        
        if (!this.epochOffset) {
            var updated = 0;
            for (var i = 0; i < updateFlightIds.length; ++i) {
                var flightId = updateFlightIds[i];
                var flight = updateData[flightId];
                updated = Math.max(flight[UPDATED], updated);
            }
            console.log("Most recently updated is " + updated);
            this.epochOffset = (new Date().getTime() / 1000) - updated;
            console.log("Offset is " + this.epochOffset);            
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
    
    updateRaw: function() {
        var that = this;
        
        FlightRadar.requestFlightsData(LOCATION.z, LOCATION.x, RANGE, RANGE, function(results){
            FlightRadar.IGNORED_KEYS.forEach(function(key){ delete results[key]; }, this);
            that.update(results);
        });
    },
};

var radar = new AUSTIN.Radar();
radar.updateRaw();
AUSTIN.updateEvery(5, function(){
    radar.updateRaw();
})

