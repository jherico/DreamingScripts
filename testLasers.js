


Script.include("./Austin.js");
Script.include("./noise/perlin.js");

var overlayProperties = {
    alpha: 1.0, 
    solid: true, 
    visible: true,
    type: "cube",
    color: AUSTIN.Colors.TronRed,
    position: AUSTIN.avatarRelativePosition({x: -0.5, y: 1, z: -1 }),
    dimensions: { x: 0.2, y: 0.2, z: 0.2 },
};

var solidCubeOverlay = new AUSTIN.Overlay(overlayProperties);
console.log("Created overlay " + solidCubeOverlay.id + " at " + AUSTIN.vec3toStr(overlayProperties.position, 2));
overlayProperties.color = AUSTIN.Colors.TronBlue;
overlayProperties.position = AUSTIN.avatarRelativePosition({x: 0.5, y: 1, z: -1 });
overlayProperties.solid = false;
var wireCubeOverlay = new AUSTIN.Overlay(overlayProperties);
console.log("Created overlay " + wireCubeOverlay.id + " at " + AUSTIN.vec3toStr(overlayProperties.position, 2));
console.log("Overlay Properties " + JSON.stringify(overlayProperties));

Script.scriptEnding.connect(function(){
    wireCubeOverlay.destroy();
    solidCubeOverlay.destroy();
});


