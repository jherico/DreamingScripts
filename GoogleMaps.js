
Google = {
    KEY: "AIzaSyDJmgU7Dtgqc-bnLeEcRwJAgRxRCsPOMbQ",
    URL: "https://maps.googleapis.com/maps/api/staticmap",
    DEGREES_PER_PIXEL: 360 / 256,
}

vec3toStr = function(v, digits) {
    if (!digits) { digits = 3; }
    return "{ " + v.x.toFixed(digits) + ", " + v.y.toFixed(digits) + ", " + v.z.toFixed(digits)+ " }";
}


//var center = { x: -122.3, y: 0, z: 47.45 };
//var center = { x: -78.4560849, y: 0, z: 0.0005385 };

Google.Map = function(properties) {
    this.position = properties.position || { x: 0, y: 0, z: 0 };
    this.size = properties.size || 2;
    this.res = properties.resolution || this.size * 256;
    this.destroyWithScript = true;
    this.center = properties.center || { x: -118.4139235, y: 0, z: 33.9411931 }; 
    this.zoomLevel = properties.zoomLevel || 13
    this.zoomDivisor = Math.pow(2, this.zoomLevel);
    this.latitudeMod = Math.cos(Math.radians(this.center.z)); 
    this.interval = { 
        x: Google.DEGREES_PER_PIXEL * this.res * -1 / this.zoomDivisor, 
        y: 0, 
        z: Google.DEGREES_PER_PIXEL * this.res * this.latitudeMod / this.zoomDivisor, 
    };
    this.inverseInterval = {
       x: 1 / this.interval.x,
       y: 0,
       z: 1 / this.interval.z,
    }

    var that = this;
    Script.scriptEnding.connect(function(){
        if (that.destroyWithScript) {
            that.destroy();
        }
    });
    
    return this;
};

Google.Map.ENTITY_NAME = "GoogleMapInstance";

Google.Map.prototype = {
    constructor: Google.Map,
    
    wipe: function() {
        var that = this;
        Entities.findEntities({ x: 0, y: 0, z: 0 }, 50).forEach(function(id) {
            var properties = Entities.getEntityProperties(id);
            if (properties.name != Google.Map.ENTITY_NAME) {
                return;
            }
            Entities.deleteEntity(id);
        });
    }, 
    
    positionToLatLong: function(v) {
        var result = Vec3.multiply(v, 1 / this.size);
        result = Vec3.multiplyVbyV(this.interval, result);
        result = Vec3.sum(this.center, result);
        return result;
    },
    
    
    latLongToPosition: function(v) {
        var result = Vec3.subtract(v, this.center);
        result = Vec3.multiplyVbyV(this.inverseInterval, result);
        result = Vec3.multiply(result, this.size);
        return result;
    },
    
    buildMap: function() {
        for (var i = 0; i < 3; ++i) {
            for (var j = 0; j < 3; ++j) {
                var position = Vec3.multiply({ x: i - 1, y: 0, z: j - 1 }, this.size);
                var latLong = this.positionToLatLong(position);
                var url = "https://maps.googleapis.com/maps/api/staticmap?center=" + latLong.z + "," + latLong.x + "&zoom=" + this.zoomLevel + "&size=" + this.res + "x" + this.res + "&maptype=roadmap&style=feature:poi|element:labels|visibility:off&style=feature:road.arterial|element:labels|visibility:off&key=AIzaSyDJmgU7Dtgqc-bnLeEcRwJAgRxRCsPOMbQ";  
                var entity = Entities.addEntity({
                    type: "Box",
                    name: Google.Map.ENTITY_NAME,
                    visible: true,
                    position: position,
                    dimensions: { x: this.size, y: 0.001, z: this.size },
                    userData: JSON.stringify({ ProceduralEntity: {
                        version: 2,
                        shaderUrl: "https://s3.amazonaws.com/DreamingContent/shaders/simpleImage.fs",
                        channels: [ url ]  
                    }}),
                });
            }
        }
        console.log("Added");
    },
};

//
//Google.Map.prototype = {
//    constructor: Google.Map,
//    // https://maps.googleapis.com/maps/api/staticmap?center=47.45,-122.3&zoom=&size=256x256&maptype=roadmap&style=feature:poi|element:labels|visibility:off&style=feature:road.arterial|element:labels|visibility:off&key=AIzaSyDJmgU7Dtgqc-bnLeEcRwJAgRxRCsPOMbQ
//};





