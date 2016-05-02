"use strict";

GEO = {}

// WGS84 ellipsoid constants:
GEO.a = 6378137
GEO.a2 = GEO.a * GEO.a
GEO.b = 6356752.31424518
GEO.b2 = GEO.b * GEO.b
GEO.b2overa2 = GEO.b2 / GEO.a2
GEO.f = 1 / 298.257223563
GEO.a2minusb2 = GEO.a2 - GEO.b2
GEO.e = Math.sqrt(GEO.a2minusb2 / GEO.a2)
GEO.e2 = GEO.e * GEO.e
GEO.eprime = Math.sqrt(GEO.a2minusb2 / GEO.b2)
GEO.EARTH_RADIUS = GEO.a

GEO.LLA2ECEF = function(lat, lon, alt) {
    var cosLat = Math.cos(lat);
    var cosLon = Math.cos(lon);
    var sinLat = Math.sin(lat);
    var sinLon = Math.sin(lon);
    var sin2Lat = sinLat * sinLat;

    // intermediate calculation
    // (prime vertical radius of curvature)
    var N = GEO.a / Math.sqrt(1 - (GEO.e2 * sin2Lat));

    // results:
    return {
        x : (N + alt) * cosLat * cosLon,
        y : (GEO.b2overa2 * N + alt) * sinLat,
        z : (N + alt) * cosLat * -sinLon,
    };
}

GEO.Mapper = function(properties) {
    this.lat = properties.lat || 51.1537
    this.lon = properties.lon || 0.1821
    this.scale = properties.scale || (1 / 10000)
    this.center = Vec3.multiply(GEO.LLA2ECEF(Math.radians(this.lat), Math.radians(this.lon), 0), this.scale);
    var q = { x: 0, y: 0, z: 0, w: 1 };
    q = Quat.multiply(Quat.fromPitchYawRollDegrees(0, -this.lon - 90, 0), q); 
    q = Quat.multiply(Quat.fromPitchYawRollDegrees(this.lat - 90, 0, 0), q);
    this.rotation = q;
    //this.rotatedCenter = { x: 0, y: -this.scale * GEO.EARTH_RADIUS, z: 0 }; //Vec3.multiplyQbyV(this.rotation, this.center);
    this.rotatedCenter = Vec3.multiply(Vec3.multiplyQbyV(this.rotation, this.center), -1);
    console.log("rotated center " + AUSTIN.vec3toStr(this.rotatedCenter));
    return this;
}

GEO.Mapper.prototype = {

    // Return the position relative to the center of the earth
    positionToVec3 : function(lat, lon, alt) {
        lat = Math.radians(lat);
        lon = Math.radians(lon);
        var result = GEO.LLA2ECEF(lat, lon, alt);
        result = Vec3.multiply(result, this.scale);
        return result;
    },
    
    // Return the position relative to the base lat/lon
    positionToRelativeVec3: function(lat, lon, alt) {
        var result = this.positionToVec3(lat, lon, alt);
        result = Vec3.multiplyQbyV(this.rotation, result);
        result = Vec3.sum(result, this.rotatedCenter);
        return result;
    },

    bearingToQuat : function(lat, lon, bearing) {
        var q = { x: 0, y: 0, z: 0, w: 1 };
        q = Quat.multiply(Quat.fromPitchYawRollDegrees(0, -bearing, 0), q); 
        q = Quat.multiply(Quat.fromPitchYawRollDegrees(lat - 90, 0, 0), q);
        q = Quat.multiply(Quat.fromPitchYawRollDegrees(0, lon - 90, 0), q); 
        return q;
    },

    bearingToRelativeQuat : function(lat, lon, bearing) {
        var q = { x: 0, y: 0, z: 0, w: 1 };
        q = Quat.multiply(Quat.fromPitchYawRollDegrees(0, -bearing, 0), q); 
        return q;
    },
}
