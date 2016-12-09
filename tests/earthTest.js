// #debug

"use strict";

Script.include("../Austin.js");
Script.include("../Earth.js")

debugger;

var quakes = [];
var earth = new AUSTIN.Earth();
earth.find();
if (!earth.id) { Script.stop(); }
earth.setRadius(3.0);
earth.clearChildren();

var position = earth.relativePosition(47.6, -122.3);
position = Vec3.multiply(Vec3.normalize(position), 3.0);

function addSpike(properties) {
    properties = properties || {};
    var lat = properties.lat || 47.6;
    var lon = properties.lon || properties.long || -122.3;
    var height = properties.height || 0.5;
    var width = properties.width || 0.1;
    var color = properties.color || { red: 255, green: 0, blue: 0 }; 
    var position = earth.relativePosition(lat, lon);
    position = Vec3.multiply(Vec3.normalize(position), 3.0);
    var orientation = earth.relativeOrientation(lat, lon, 0);;
    var entityProperties = {
        parentID: earth.id,
        type: "Sphere",
        localPosition: position,
        localRotation: orientation,
        color: color,
        visible: true,
        dimensions: { x: width, y: height, z: width },
        registrationPoint: { x: 0.5, y: 0.0, z: 0.5 },
        lifetime: 60,
    };
    var entity = Entities.addEntity(entityProperties);
}


function getQuakeData(callback) {
    AUSTIN.queryJson("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson", function(json){
    	json.features.forEach(function(feature) {
    		var height = 0.5;
    		var width = 0.05;
    		var color = { red: 255, green: 255, blue: 0 };
    		if (feature.properties.mag > 6.0) {
    			height = 0.8;
    			width = 0.08;
    			color = { red: 255, green: 0, blue: 0 };
    		}
    		addSpike({
    			lat: feature.geometry.coordinates[1],
    			lon: feature.geometry.coordinates[0],
    			height: height,
    			color: color,
    		})
    	});
    });
}

getQuakeData(function(){});



//Script.stop();
