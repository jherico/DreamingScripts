//#Flocking
// Based on flocking http://processingjs.org/learning/topic/flocking/  by [Daniel Shiffman](http://www.shiffman.net)

/*
 * Copyright (c) 2009 Daniel Shiffman
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * http://creativecommons.org/licenses/LGPL/2.1/
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

 
// file:///C:/Users/bdavis/Git/dreaming/scripts/flocking.js
(function(){
    print("Importing")
    Script.include("three/Three.js");
    print("Importing done")
    var rate = 20;
    var updateInterval = 1.0 / rate;
    var maxspeed = 1.0 / rate;
    var maxspeedVec = new THREE.Vector3(maxspeed, maxspeed / 5.0, maxspeed);
    var negmaxspeedVec = maxspeedVec.clone().multiplyScalar(-1.0);
    var maxforce = 0.005;
    var maxforceVec = new THREE.Vector3(maxforce, maxforce * 3.0, maxforce)
    var negmaxforceVec = maxforceVec.clone().multiplyScalar(-1.0);
    var radius = 2.5
    var neighbordist = 0.4;
    var neighbordistSq = neighbordist * neighbordist;
    var desiredseparation = 0.1;
    var desiredseparationSq = desiredseparation * desiredseparation;
    var boidCount = 80;
    var clock = 0;

    var FLOCKING = {}

    // Boid class
    // Methods for Separation, Cohesion, Alignment added
    FLOCKING.Boid = function () {
        this.loc = new THREE.Vector3().random(0.2, -0.1);
        this.vel = new THREE.Vector3().random(maxspeed * 2.0, -maxspeed);
        this.vel.z /= 5.0;
        this.acc = new THREE.Vector3();
        this.id = Overlays.addOverlay("model", {
            url: "https://s3.amazonaws.com/DreamingContent/assets/models/fish/Golden_Fish_FBX.FBX",
            position: { x: 0, y: 0, z: 0 },
            scale: 0.05, size: 0.05, visible: true,
        });
        this.oldLoc = this.loc.clone();
    }
    
    FLOCKING.Boid.prototype = {
        constructor: FLOCKING.Boid,
    
        run: function(flock) {
            this.flock(flock);
            this.borders(flock);
            this.update();
            this.render();
        },
        
        destroy: function() {
            print("Deleting overlay " + this.id);
            Overlays.deleteOverlay(this.id);
        },
    
        render: function() {
            Overlays.editOverlay(this.id, {
                position: { x: this.loc.x, y: this.loc.y, z: this.loc.z },
                rotation: Quat.rotationBetween(Vec3.UNIT_X, this.vel),
            });
        },
        
        update: function() {
            // Update velocity & clear acceleration 
            this.vel.add(this.acc);
            this.acc.clear();
            // Limit speed
            this.vel.clampScalar(-maxspeed, maxspeed);
            // update location
            this.oldLoc = this.loc.clone();
            this.loc.add(this.vel);
        },
        
        flock: function(flock) {
            var sep = this.separate(flock.boids);   // Separation
            var ali = this.align(flock.boids);      // Alignment
            var coh = this.cohesion(flock.boids);   // Cohesion
            
            // Arbitrarily weight these forces
            sep.multiplyScalar(1.6);
            ali.multiplyScalar(0.2);
            coh.multiplyScalar(0.2);
    
            // Add the force vectors to acceleration
            this.acc.add(sep);
            this.acc.add(ali);
            this.acc.add(coh);
        },
    
        // Wraparound FIXME... use a master force for the average position of the flock towards the center
        borders: function(flock) {
            var relLoc = this.loc.clone().sub(flock.center);
            var d = relLoc.lengthSq();
            var radiusSq = flock.radius * flock.radius;
            if (d > radiusSq) {
                var bor = this.steer(flock.center);
                bor.multiplyScalar(1.8);
                this.acc.add(bor);
            }
            if (d > radiusSq * 4) {
                this.loc = flock.center.clone();
            }
        },
    
        // A method that calculates a steering vector towards a target
        // Takes a second argument, if true, it slows down as it approaches the target
        steer: function(target) {
            // A vector pointing from the location to the target
            var desired = target.clone().sub(this.loc);
            var d = desired.length();
            // Distance from the target is the magnitude of the vector
            // If the distance is greater than 0, calc steering (otherwise return zero vector)
            if (d > 0) {
                // Normalize desired and set to max speed
                desired.divideScalar(d).multiply(maxspeedVec);
                // Steering = Desired minus Velocity
                desired.sub(this.vel);
                d = desired.length();
                if (d > maxforce) {
                    desired.divideScalar(d);
                    desired.multiply(maxforceVec);
                }
                return desired;  // Limit to maximum steering force
            }
            return new THREE.Vector3();
        },
        
        // Separation
        // Method checks for nearby boids and steers away
        separate: function(boids) {
            var count = 0;
            var steer = new THREE.Vector3();
            for (var i = 0; i < boids.length; ++i) {
                var other = boids[i];
                var diff = this.loc.clone().sub(other.oldLoc);
                var d = diff.lengthSq();
                // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
                if ((d > 0) && (d < desiredseparationSq)) {
                    d = Math.sqrt(d);
                    // Calculate vector pointing away from neighbor
                    // normalizeTo(1.0/d);
                    diff.divideScalar(d).divideScalar(d);
                    steer.add(diff);
                    ++count;            // Keep track of how many
                }
            }
            // For every boid in the system, check if it's too close
            // Average -- divide by how many
            if (count > 0) {
                steer.divideScalar(count);
            }
            // As long as the vector is greater than 0
            if (steer.lengthSq() > 0) {
                // Implement Reynolds: Steering = Desired - Velocity
                steer.normalize().multiplyScalar(maxspeed).sub(this.vel).clamp(negmaxforceVec, maxforceVec);
            }
            return steer;
        },
        
        // Alignment
        // For every nearby boid in the system, calculate the average velocity
        align: function(boids) {
            var steer = new THREE.Vector3();
            var count = 0;
            for (var i = 0 ; i < boids.length; ++i) {
                var other = boids[i];
                var diff = this.loc.clone().sub(other.oldLoc);
                var d = diff.lengthSq();
                if ((d > 0) && (d < neighbordistSq)) {
                    steer.add(other.vel);
                    ++count;
                }
            }
    
            if (count > 0) {
                steer.divideScalar(count);
            }
    
            // As long as the vector is greater than 0
            if (steer.lengthSq() > 0) {
                // Implement Reynolds: Steering = Desired - Velocity
                steer.normalize().multiplyScalar(maxspeed).sub(this.vel).clampScalar(-maxforce, maxforce);
            }
            return steer;
        },
        
        
        // Cohesion
        // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
        cohesion: function(boids) {
            var sum = new THREE.Vector3();   // Start with empty vector to accumulate all locations
            var count = 0;
            for (var i = 0 ; i < boids.length; ++i) {
                var other = boids[i];
                var diff = this.loc.clone().sub(other.oldLoc);
                var d = diff.lengthSq();
                if ((d > 0) && (d < neighbordistSq)) {
                    sum.add(other.oldLoc); // Add location
                    ++count;
                }
            }
            if (count > 0) {
                sum.divideScalar(count);
                return this.steer(sum,false);  
            }
            return sum;
        }
    };
    
    FLOCKING.Flock = function (count, center) {
        if (!count) {
            count = boidCount;
        }
        this.center = new THREE.Vector3(center.x, center.y, center.z);
        this.max = new THREE.Vector3(1, 1, 1);
        this.min = this.max.clone().multiplyScalar(-1.0);
        this.radius = radius;
        //this.box = Overlays.addOverlay("cube", {
        //    position: this.center,
        //    color: { red: 0, green: 90, blue: 255 },
        //    alpha: 0.1, dimensions: { x: radius * 4, y: 2, z: radius * 4 }, solid: true, visible: true,
        //});
        //this.box2 = Overlays.addOverlay("cube", {
        //    position: this.center,
        //    color: { red: 0, green: 0, blue: 0 },
        //    alpha: 1.0, dimensions: { x: radius * 4, y: 2, z: radius * 4 }, solid: false, lineWidth: 4, visible: true,
        //});
    
        this.boids = [];
        // Add an initial set of boids into the system
        for (var i = 0; i < count; i++) {
            var newBoid = new FLOCKING.Boid();
            newBoid.loc = this.center.clone();
            this.boids.push(newBoid);
            
            //new THREE.Vector3(width/2,height/2),3.0,0.05)
        }
    };
    
    FLOCKING.Flock.prototype = {
        constructor: FLOCKING.Flock,
        run: function() {
            for (var i = 0 ; i < this.boids.length; ++i) {
                var boid = this.boids[i];
                boid.run(this);
            }
        },
    
        destroy: function() {
            //Overlays.deleteOverlay(this.box);
            //Overlays.deleteOverlay(this.box2);
            for (var i = 0 ; i < this.boids.length; ++i) {
                var boid = this.boids[i];
                boid.destroy();
            }
        }
    };

    var flock;
    var accumulator;
    FLOCKING.Aquarium = function() {
    };

    // file:///C:/Users/bdavis/Git/dreaming/scripts/flocking.js
    FLOCKING.Aquarium.prototype = {
        constructor: FLOCKING.Aquarium,
        
        update: function(delta) {
            if (isNaN(accumulator)) {
                accumulator = 0;
            }
            accumulator += delta;
            clock += delta;
            if (accumulator > updateInterval) {
                flock.run();
                accumulator = 0;
            }
        },
        
        preload: function(entityID) {
            print("preload");
            this.entityID = entityID;
            if (flock) { flock.destroy(); }
            var position = Entities.getEntityProperties(entityID, ['position']).position;

            flock = new FLOCKING.Flock(boidCount, position);
            accumulator = 0.0;
            print("Connecting")
            Script.update.connect(this.update);
        },
        
        unload: function(entityId) {
            print("unload");
            flock.destroy();
            Script.update.disconnect(this.update);
        },
    
        clickDownOnEntity: function(entityID, mouseEvent) {
            print("Clicked on entity");
        }
    };
    return new FLOCKING.Aquarium();
});


