// z#debug

"use strict";

Script.include("../Austin.js");
Script.include("../Earth.js")

//debugger;

var earth = new AUSTIN.Earth();
earth.find();
earth.setRadius(3.0);

var position = earth.relativePosition(47.6, -122.3);
position = Vec3.multiply(Vec3.normalize(position), 3.0);

var entityProperties = {
    type: "Sphere",
    localPosition: position,
    color: { red: 255, green: 0, blue: 0 },
    visible: true,
    dimensions: { x: 0.2, y: 0.2, z: 0.2 },
    lifetime: 10,
    parentID: earth.id,
};

var entity = Entities.addEntity(entityProperties);

//Script.stop();
