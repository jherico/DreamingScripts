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

GEO.LLA2ECEF = function(lat, lon, alt) {
	var cosLat = Math.cos(lat);
	var cosLon = Math.cos(lon);
	var sinLat = Math.sin(lat);
	var sinLon = Math.sin(lon);
	var sin2Lat = sinLat * sinLat;

	// intermediate calculation
	// (prime vertical radius of curvature)
	var N = GEO.a / Math.sqrt(1 - (GEO.e2 * sin2Lat));
	//N = 1;
	//alt = 0;
	
	// results:
	return {
		x: (N+alt) * cosLat * cosLon,
		y: (N+alt) * cosLat * sinLon,
		z: (GEO.b2overa2 * N + alt) * sinLat,
	};
}

