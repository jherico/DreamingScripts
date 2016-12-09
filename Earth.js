"use strict";

Script.include("./Austin.js");
Script.include("./Geo.js");
Script.include("./util/SunCalc.js")

AUSTIN.EarthConstants = {};
AUSTIN.EarthConstants.RADIUS = 6371 * 1000;
AUSTIN.EarthConstants.DIAMETER = AUSTIN.EarthConstants.RADIUS * 2;
AUSTIN.EarthConstants.CIRCUMFERENCE = AUSTIN.EarthConstants.DIAMETER * Math.PI;
AUSTIN.EarthConstants.ENTITY_NAME = "Austin.Earth";
AUSTIN.EarthConstants.LO_RES_IMAGE = "https://s3.amazonaws.com/DreamingContent/assets/images/earthwgrid.png";
AUSTIN.EarthConstants.HI_RES_IMAGE = "https://s3.amazonaws.com/DreamingContent/assets/images/2_no_clouds_16k.jpg";
AUSTIN.EarthConstants.NIGHT_IMAGE = "https://s3.amazonaws.com/DreamingContent/assets/images/land_ocean_ice_lights_8192.png";
AUSTIN.EarthConstants.EARTH_IMAGE = AUSTIN.EarthConstants.HI_RES_IMAGE;

AUSTIN.EarthConstants.DAY_TEXTURE_INDEX = 0;
AUSTIN.EarthConstants.NIGHT_TEXTURE_INDEX = 1;
AUSTIN.EarthConstants.DETAIL_TEXTURE_INDEX = 2;

AUSTIN.EarthConstants.PROCEDURAL_PARAMS = {
    ProceduralEntity: {
        version: 2,
        shaderUrl: "https://s3.amazonaws.com/DreamingContent/shaders/globeMap.fs",
        channels: [
            AUSTIN.EarthConstants.EARTH_IMAGE,
            AUSTIN.EarthConstants.NIGHT_IMAGE
        ],
        uniforms: {}
    }
}

AUSTIN.EarthConstants.ENTITY_PROPERTIES = {
    type: "Sphere",
    name: AUSTIN.EarthConstants.ENTITY_NAME,
    position: { x: 0, y: 0, z: 0 },
    dimensions: Vec3.multiply(Vec3.ONE, 0.5),
    userData: JSON.stringify(AUSTIN.EarthConstants.PROCEDURAL_PARAMS),
};

AUSTIN.Earth = function(properties) {
    properties = properties || {};
    this.radius = properties.radius || 0.25;
    this.scale = this.radius / AUSTIN.EarthConstants.RADIUS;
    this.position = properties.position || Vec3.ZERO;
    this.queuedTextures = { };

    var self = this;
    Entities.findEntities(this.position, 50).forEach(function(id) {
        var properties = Entities.getEntityProperties(id);
        if (properties.name === AUSTIN.EarthConstants.ENTITY_NAME) {
            self.id = id;
            return;    
        }
    });
}

AUSTIN.Earth.prefetch = function() {
    if (TextureCache && TextureCache.prefetch) {
        var result = [
            TextureCache.prefetch(AUSTIN.EarthConstants.EARTH_IMAGE),
            TextureCache.prefetch(AUSTIN.EarthConstants.NIGHT_IMAGE),
        ];
    }
}

AUSTIN.Earth.findExisting = function(position, range) {
    position = position || Vec3.ZERO;
    range = range || 50;
    
    Entities.findEntities(position, range).forEach(function(id) {
        var properties = Entities.getEntityProperties(id);
        if (properties.name === AUSTIN.EarthConstants.ENTITY_NAME) {
            return id;    
        }
    });
    return;
}


AUSTIN.Earth.clear = function(position, range) {
    AUSTIN.Earth.findExisting(position, range).forEach(function(id) {
        var properties = Entities.getEntityProperties(id);
        if (properties.name === AUSTIN.EarthConstants.ENTITY_NAME) {
            Entities.deleteEntity(id);
            return;    
        }
    });
},

AUSTIN.Earth.topRotation = function(lat, lon) {
    var q = Quat.fromPitchYawRollDegrees(0, 180 - lon, 0);
    q = Quat.multiply(Quat.fromPitchYawRollDegrees((90 - lat) * -1, 0, 0), q);
    return q;
}

AUSTIN.Earth.frontRotation = function(lat, lon) {
    var q1 = Quat.fromPitchYawRollDegrees(0, 180 - lon, 0);
    var q2 = Quat.fromPitchYawRollDegrees(lat, 0, 0);
    q = Quat.multiply(q2, q1);
    return q;
}

AUSTIN.Earth.prototype = {
    constructor: AUSTIN.Earth,

    build: function() {
        if (!this.id) {
            var existing = AUSTIN.Earth.findExisting();
            if (existing) {
                this.id = existing;
                return;
            }
        }

        if (this.id) {
            var properties = Entities.getEntityProperties(this.id);
            //this.setRadius();
            return;
        }

        this.id = Entities.addEntity(AUSTIN.EarthConstants.ENTITY_PROPERTIES);
    },
    
    find: function() {
        if (!this.id) {
            var existing = AUSTIN.Earth.findExisting();
            if (existing) {
                this.id = existing;
                return;
            }
        }
    },

    forceBuild: function() {
        this.destroy();
        this.build();
    },
    
    destroy: function() {
        if (this.id) {
            Entities.deleteEntity(this.id);
            this.id = null;
        }
    },
    
    clearChildren: function(predicate) {
        if (!this.id) {
            return
        }
        var position = Entities.getEntityProperties(this.id, ['position']).position;
        var that = this;
        Entities.findEntities(position, 100).forEach(function(id) {
            var properties = Entities.getEntityProperties(id);
            if (properties.parentID === that.id && ((!predicate) || predicate(properties))) {
                Entities.deleteEntity(id);
                return;    
            }
        });
    },
    
    relativePosition: function(lat, lon, alt) {
        alt = alt || 0;
        var result = GEO.LLA2ECEF(Math.radians(lat), Math.radians(lon), 0);
        var distance = this.radius + (this.scale * alt);
        result = Vec3.multiply(result, distance);
        return result;
    },
    
    relativeOrientation: function(lat, lon, bearing) {
        var q = { x: 0, y: 0, z: 0, w: 1 };
        var yaw = lon;
        var pitch = lat - 90;
        q = Quat.multiply(Quat.fromPitchYawRollDegrees(0, -bearing, 0), q)
        q = Quat.multiply(Quat.fromPitchYawRollDegrees(pitch, 0, 0), q);
        q = Quat.multiply(Quat.fromPitchYawRollDegrees(0, yaw, 0), q);
        return q;
    },

    fetchUserData: function() {
        if (this.userData) {
            return;
        }
        this.userData = JSON.parse(Entities.getEntityProperties(this.id, [ 'userData' ]).userData);
    },
    
    commitUserData: function() {
        if (!this.userData) {
            return;
        }
        Entities.editEntity(this.id, {
            visible: true,
            userData: JSON.stringify(this.userData),
        });
    },
    
    setLoadedTexture: function(index, url, callback) {
        console.log("Setting loaded texture " + index + " url ");
        this.fetchUserData();
        this.userData.ProceduralEntity.channels[index] = url;
        if (callback) { callback(); }
        this.commitUserData();
        var self = this;
        Script.setTimeout(function(){
            delete self.queuedTextures[url];
        }, 100);
    },
    
    setTexture: function(index, url, callback) {
        console.log("Setting texture " + url);
        if (this.queuedTextures[url]) {
            console.log("Already queued " + url);
            return;
        }

        var FINISHED = 3;
        var resource = TextureCache.prefetch(url);
        var state = resource.state;
        // Already loaded, just set the texture
        if (state == FINISHED) {
            console.log("Texture already present, using");
            this.setLoadedTexture(index, url, callback);
            return;
        } 

        this.queuedTextures[url] = {
            index: index,
            url: url,
            resource: resource,
        };

        var self = this;
        console.log("Texture queued for download");
        resource.stateChanged.connect(function(newState){
            console.log("New texture download state " + newState)
            if (newState === FINISHED) {
                console.log("Texture downloaded, using");
                self.setLoadedTexture(index, url, callback);
                return;
            } 
        });
    },
    
    setUniform: function(name, value) {
        if (!this.userData.ProceduralEntity.uniforms) {
            this.userData.ProceduralEntity.uniforms = {}
        }
        this.userData.ProceduralEntity.uniforms[name] = value;
    },
    
    clearUniform: function(name) {
        if (this.userData.ProceduralEntity.uniforms) {
            delete this.userData.ProceduralEntity.uniforms[name]
        }
    },

    setDayTexture: function(url) {
        this.setTexture(index, url);
    },
    
    resetTextures: function() {
        this.setTexture(0, AUSTIN.EarthConstants.EARTH_IMAGE);
//        this.setTexture(1, AUSTIN.EarthConstants.NIGHT_IMAGE);
    },

    UNIFORM_MARKER_NORMAL: 'iMarkerNormal',
    UNIFORM_MARKER_SIZE_DEGREES: 'iMarkerSizeDegrees',

    showMarker: function(lat, lon, degrees) {
        this.fetchUserData();
        var markerNormal =  GEO.LLA2ECEF(Math.radians(lat), Math.radians(lon), 0);
        this.setUniform(this.UNIFORM_MARKER_NORMAL, [ markerNormal.x, markerNormal.y, markerNormal.z ]);
        degrees = degrees || 0.1;
        this.setUniform(this.UNIFORM_MARKER_SIZE_DEGREES, degrees);
        this.commitUserData()
    },
    
    clearMarker: function() {
        this.fetchUserData();
        this.setUniform(this.UNIFORM_MARKER_SIZE_DEGREES, 0);
        this.commitUserData()
    },

    UNIFORM_SUN_NORMAL: 'iSunNormal', 

    enableDayNight: function() {
        this.fetchUserData();
        var show = true;
        if (arguments.length) {
            show = arguments[0];
        }

        if (show) {
            var sunPosition = SunCalc.getPosition(new Date(), 89.999, 0);
            var sunNormal =  GEO.LLA2ECEF(sunPosition.altitude, -sunPosition.azimuth, 0);
            this.setUniform(this.UNIFORM_SUN_NORMAL, [ sunNormal.x, sunNormal.y, sunNormal.z ]);
        } else {
            this.clearUniform(this.UNIFORM_SUN_NORMAL);
        }

        this.commitUserData();
    },
    
    setScale: function(scale) {
        this.setRadius(scale * AUSTIN.EarthConstants.RADIUS);
    },
    
    setRadius: function(r) {
        this.radius = r;
        this.scale = r / AUSTIN.EarthConstants.RADIUS;
        this.newDimensions = { x: r * 2, y: r * 2, z: r * 2 };
    },

    setRotation: function(q) {
        this.newRotation = q;
    },
    
    setPosition: function(p) {
        this.newPosition = p;
    },

    animate: function(properties) {
        if (!this.id) {
            return;
        }
        if (!properties) {
            properties = {};
        }
        this.oldProperties = Entities.getEntityProperties(this.id);
        if (!this.newRotation) { this.newRotation = this.oldProperties.rotation; }
        if (!this.newDimensions) { this.newDimensions = this.oldProperties.dimensions; }
        if (!this.newPosition) { this.newPosition = this.oldProperties.position; }
        var duration = properties.duration;
        if (!duration) {
            var dot = Vec3.dot(Quat.getFront(this.oldProperties.rotation), Quat.getFront(this.newRotation));
            // 0 is no angle, 1 is 180 degree angle
            var delta =  (1 - dot) / 2;
            if (delta > 0) {
                // rotate at about 18 degrees per second
                duration = Math.max(2, 10 * delta);
            } else {
                duration = 2.5;
            }
        }

        this.animation = new AUSTIN.Easing({
            type: properties.easing || 'easeInOutQuad',
            duration: duration,
            completion: properties.callback,
        });

        if (!this.animator) {
            var self = this;        
            this.animator = new AUSTIN.Updater(0.01, function(delta){
                self.animationUpdate();
            });
        }
        this.animator.start();
    },
    
    animationUpdate: function(delta) {
        if (this.animation) {
            if (this.animation.expired()) {
                this.animator.stop();
                Entities.editEntity(this.id, {
                    dimensions: this.newDimensions,
                    localPosition: this.newPosition,
                    localRotation: this.newRotation,
                });
                this.newPosition = null;
                this.newRotation = null;
                this.newDimensions = null;
                if (this.animation.completion) {
                    this.animation.completion();
                }
                this.animation = null;
            } else if (this.animation.ready()) {
                var alpha = this.animation.easingValue();
                var p = Vec3.mix(this.oldProperties.position, this.newPosition, alpha);
                var r = Quat.slerp(this.oldProperties.rotation, this.newRotation, alpha);
                var d = Vec3.mix(this.oldProperties.dimensions, this.newDimensions, alpha);
                Entities.editEntity(this.id, {
                    dimensions: d,
                    localPosition: p,
                    localRotation: r,
                });
            }
        }

    }
}
