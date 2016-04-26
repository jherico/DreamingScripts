"use strict";

Script.include("./Austin.js");
Script.include("./FlightRadar.js");

var IGNORED_KEYS = ['version', 'stats', 'selected-aircraft', 'full_count' ];

AUSTIN.Radar = function(type, properties) {
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
        var newFlight = {
            id: flightId, 
            raw: flight,
            entity: null,
        };
        this.flights[flightId] = newFlight;
        newFlight.entity = Entities.addEntity({
            type: "Model",
            name: this.ENTITY_NAME,
            modelURL: "https://s3.amazonaws.com/DreamingContent/assets/simple/SimpleAirport/Models/jet05.fbx",
            position: FlightRadar.flightToPosition(flight),
            rotation: FlightRadar.flightToRotation(flight),
            velocity: FlightRadar.flightToVelocity(flight),
            visible: true,
            damping: 0,
            userData: JSON.stringify({
                flight: {
                    id: flightId,
                    data: flight,
                }
            }),
        });
        console.log("Added");
    },
    
    updateFlight: function(flightId, flight) {
        if (!(flightId in this.flights)) {
            this.addFlight(flightId, flight);
            return;
        }

        var updateFlight = this.flights[flightId];
        if (flight[UPDATED] > updateFlight.raw[UPDATED]) {
            updateFlight.raw = flight;
            Entities.editEntity(updateFlight.entity, {
                position: FlightRadar.flightToPosition(flight),
                rotation: FlightRadar.flightToRotation(flight),
                velocity: FlightRadar.flightToVelocity(flight),
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
    }
};

var radar = new AUSTIN.Radar();
radar.wipe();

AUSTIN.updateEvery(1, function(){
    radar.updateRaw();
})

