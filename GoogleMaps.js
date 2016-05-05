

Google = {
    Maps: {
        KEY: "AIzaSyDJmgU7Dtgqc-bnLeEcRwJAgRxRCsPOMbQ",
        URL: "https://maps.googleapis.com/maps/api/staticmap",
        DEGREES_PER_PIXEL: 360 / 256,
    }
}


//var center = { x: -122.3, y: 0, z: 47.45 };
//var center = { x: -78.4560849, y: 0, z: 0.0005385 };
Math.log2 = Math.log2 || function(x) {
  return Math.log(x) / Math.LN2;
};



function intersectRayXyPlane(origin, direction) {
    var normal = { x: 0, y: 1, z: 0 };
    var denom = Vec3.dot(normal, direction)
    console.log("denom " + denom);
    var dot = Vec3.dot(normal, origin);
    console.log("dot " + dot);
    var t = -dot / denom
    console.log("Distance " + t);
    var l = Vec3.multiply(direction, t);
    var result = Vec3.sum(origin, l);
    return result;
}

Google.Map = function(properties) {
    this.lat = properties.lat;
    this.lon = properties.lon;
    this.range = properties.range;
    this.scale = properties.scale;
    this.latitudeMod = Math.cos(Math.radians(this.lat));
    this.position = properties.position || { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0, w: 1 };
    this.zoomLevel = Math.floor(Math.log2(360 / (this.range * 2)));
    this.zoomDivisor = Math.pow(2, this.zoomLevel);
    this.actualRange = 360 / this.zoomDivisor;
    this.geoMapper = properties.geoMapper;
    
    print("this.latitudeMod" + this.latitudeMod);
    var centerPos = this.geoMapper.positionToRelativeVec3(this.lat, this.lon, 0);

    var minLon = this.lon - this.actualRange;
    minLon = this.geoMapper.positionToRelativeVec3(this.lat, minLon, 0);
    minLon = Vec3.normalize(Vec3.subtract(minLon, this.geoMapper.rotatedCenter));
    minLon = intersectRayXyPlane(this.geoMapper.rotatedCenter, minLon);
    var minLat = this.lat + this.actualRange * this.latitudeMod;
    minLat = this.geoMapper.positionToRelativeVec3(minLat, this.lon, 0);
    minLat = Vec3.normalize(Vec3.subtract(minLat, this.geoMapper.rotatedCenter));
    minLat = intersectRayXyPlane(this.geoMapper.rotatedCenter, minLat);
    
    
    console.log("AAAAA " + AUSTIN.vec3toStr(centerPos));
    console.log("AAAAA " + AUSTIN.vec3toStr(minLat));
    console.log("AAAAA " + AUSTIN.vec3toStr(minLon));
    
    // Epic fail, replace with proper code for intersection with the xz axis
    this.xSize = Math.abs(minLon.x) * 2.0;
    this.zSize = Math.abs(minLat.z) * 2.0;
    this.size = properties.size || 2;
    this.res = properties.resolution || this.size * 256;
    this.destroyWithScript = true;
    this.center = properties.center || { x: -118.4139235, y: 0, z: 33.9411931 }; 

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
    
    destroy: function() {
        this.wipe();
    },
    
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
    
    buildMap: function() {
        var url = Google.Maps.URL + "?center=" + this.lat + "," + this.lon + "&zoom=" + this.zoomLevel + "&size=" + this.res + "x" + this.res + "&scale=2&maptype=roadmap&style=feature:poi|element:labels|visibility:off&style=feature:road.arterial|element:labels|visibility:off&key=" + Google.Maps.KEY;
        console.log("URL " + url);
        var entity = Entities.addEntity({
            type: "Box",
            name: Google.Map.ENTITY_NAME,
            visible: true,
            position: { x: this.geoMapper.rotatedCenter.x, y: 0, z: this.geoMapper.rotatedCenter.z },
            dimensions: { x: this.xSize, y: 0.001, z: this.zSize },
            userData: JSON.stringify({ ProceduralEntity: {
                version: 2,
                shaderUrl: "https://s3.amazonaws.com/DreamingContent/shaders/simpleImage.fs",
                channels: [ url ]  
            }}),
        });
    },
};

//
//Google.Map.prototype = {
//    constructor: Google.Map,
//    // https://maps.googleapis.com/maps/api/staticmap?center=47.45,-122.3&zoom=&size=256x256&maptype=roadmap&style=feature:poi|element:labels|visibility:off&style=feature:road.arterial|element:labels|visibility:off&key=AIzaSyDJmgU7Dtgqc-bnLeEcRwJAgRxRCsPOMbQ
//};





