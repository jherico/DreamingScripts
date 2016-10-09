Script.include("../Austin.js");
Script.include("../noise/perlin.js");

var overlays = [];
var orientation = { x: 0, y: 0, z: 0, w: 1 };
var center = AUSTIN.avatarRelativePosition({x: 0, y: 0.5, z: -1 });
var multiEditEnabled = Overlays.editOverlays  ? true : false;

function init() {
    // Cubes
    var overlayProperties = {};
    overlayProperties = {
        alpha: 1.0, 
        solid: false, 
        visible: true,
        type: "shape",
        shape: "Hexagon",
        position: Vec3.sum(center, { x: 0, y: 0, z: 0 }),
        color: AUSTIN.Colors.TronRed,
        dimensions: { x: 0.2, y: 0.2, z: 0.2 },
    };

    for (var x = 0; x < 2000; ++x) {
        overlays.push(new AUSTIN.Overlay(overlayProperties));
    }
}

var start = AUSTIN.now();
function update() {
    var delta = (AUSTIN.now() - start) / 1000.0;
    var rotation = Quat.angleAxis(delta * 300.0, Vec3.UNIT_Y);
    var edits = {};
    if (multiEditEnabled) {
        overlays.forEach(function(overlay){
            edits[overlay.id] = { rotation: rotation }; 
        });
        Overlays.editOverlays(edits);
    } else {
        overlays.forEach(function(overlay){
            overlay.edit({ rotation: rotation }); 
        });
    }
}

function cleanup() {
    overlays.forEach(function(overlay){
        overlay.destroy();
    });
}

init();
Script.scriptEnding.connect(cleanup);
Script.setInterval(update, 5);

