


Script.include("../Austin.js");
Script.include("../noise/perlin.js");

var overlays = [];
var orientation = { x: 0, y: 0, z: 0, w: 1 };
var lineOverlay;
var glowLineOverlay;
var center = AUSTIN.avatarRelativePosition({x: 0, y: 1, z: -1 });
var lineStart = { x: -0.5, y: 0, z: 0 };
var lineEnd = { x: 0.5, y: 0, z: 0 };

var glowLineStart = { x: -0.5, y: 0.2, z: 0 };
var glowLineEnd = { x: 0.5, y: 0.2, z: 0 };

function init() {
    // Cubes
    var overlayProperties = {};
    
    overlayProperties = {
        alpha: 1.0, 
        solid: true, 
        visible: true,
        type: "cube",
        color: AUSTIN.Colors.TronRed,
        position: Vec3.sum(center, { x: -0.5, y: 0, z: 0 }),
        dimensions: { x: 0.2, y: 0.2, z: 0.2 },
    };

    overlays.push(new AUSTIN.Overlay(overlayProperties));
    overlayProperties.color = { red: 0xDA, green: 0xA5, blue: 0x20 };
    overlayProperties.position = Vec3.sum(center, { x: -0.5, y: 0.4, z: 0 });
    overlayProperties.alpha = 0.2;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties.color = AUSTIN.Colors.TronBlue;
    overlayProperties.position = Vec3.sum(center, { x: -0.5, y: -0.4, z: 0 });
    overlayProperties.alpha = 1.0;
    overlayProperties.solid = false;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties = {
        alpha: 1.0, 
        solid: true, 
        visible: true,
        type: "shape",
        shape: "Triangle",
        color: AUSTIN.Colors.TronRed,
        position: Vec3.sum(center, { x: -0.8, y: 0, z: 0.0 }),
        dimensions: { x: 0.2, y: 0.2, z: 0.2 },
    };
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties.color = { red: 0xDA, green: 0xA5, blue: 0x20 };
    overlayProperties.position = Vec3.sum(center, { x: -0.8, y: 0.4, z: 0.0 });
    overlayProperties.alpha = 0.2;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties.color = AUSTIN.Colors.TronBlue;
    overlayProperties.position = Vec3.sum(center, { x: -0.8, y: -0.4, z: 0.0 });
    overlayProperties.alpha = 1.0;
    overlayProperties.solid = false;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties = {
        alpha: 1.0, 
        solid: true, 
        visible: true,
        type: "shape",
        shape: "Hexagon",
        color: AUSTIN.Colors.TronRed,
        position: Vec3.sum(center, { x: -0.8, y: 0, z: 0.3 }),
        dimensions: { x: 0.2, y: 0.2, z: 0.2 },
    };
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties.color = { red: 0xDA, green: 0xA5, blue: 0x20 };
    overlayProperties.position = Vec3.sum(center, { x: -0.8, y: 0.4, z: 0.3 });
    overlayProperties.alpha = 0.2;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties.color = AUSTIN.Colors.TronBlue;
    overlayProperties.position = Vec3.sum(center, { x: -0.8, y: -0.4, z: 0.3 });
    overlayProperties.alpha = 1.0;
    overlayProperties.solid = false;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties = {
        alpha: 1.0, 
        solid: true, 
        visible: true,
        type: "shape",
        shape: "Octagon",
        color: AUSTIN.Colors.TronRed,
        position: Vec3.sum(center, { x: -0.8, y: 0, z: 0.6 }),
        dimensions: { x: 0.2, y: 0.2, z: 0.2 },
    };
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties.color = { red: 0xDA, green: 0xA5, blue: 0x20 };
    overlayProperties.position = Vec3.sum(center, { x: -0.8, y: 0.4, z: 0.6 });
    overlayProperties.alpha = 0.2;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties.color = AUSTIN.Colors.TronBlue;
    overlayProperties.position = Vec3.sum(center, { x: -0.8, y: -0.4, z: 0.6 });
    overlayProperties.alpha = 1.0;
    overlayProperties.solid = false;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    // Spheres
    overlayProperties.solid = true;
    overlayProperties.type = "sphere";
    overlayProperties.position =  Vec3.sum(center, { x: 0.5, y: 0, z: 0 });
    overlayProperties.color = AUSTIN.Colors.TronRed;
    overlays.push(new AUSTIN.Overlay(overlayProperties));
    
    overlayProperties.color = { red: 0xDA, green: 0xA5, blue: 0x20 };
    overlayProperties.position = Vec3.sum(center, { x: 0.5, y: 0.4, z: 0 });
    overlayProperties.alpha = 0.2;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties.color = AUSTIN.Colors.TronBlue;
    overlayProperties.position = Vec3.sum(center, { x: 0.5, y: -0.4, z: 0 });
    overlayProperties.alpha = 1.0;
    overlayProperties.solid = false;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    // Circles
    overlayProperties = {
        alpha: 1.0, 
        solid: true, 
        visible: true,
        type: "circle3d",
        color: AUSTIN.Colors.TronRed,
        position: Vec3.sum(center, { x: -0.2, y: 0, z: -0.5 }),
        radius: 0.1,
    };
    overlays.push(new AUSTIN.Overlay(overlayProperties));
    overlayProperties.color = { red: 0xDA, green: 0xA5, blue: 0x20 };
    overlayProperties.position = Vec3.sum(center, { x: -0.2, y: 0.4, z: -0.5 });
    overlayProperties.alpha = 0.3;
    overlays.push(new AUSTIN.Overlay(overlayProperties));
    
    overlayProperties.color = AUSTIN.Colors.TronBlue;
    overlayProperties.position = Vec3.sum(center, { x: -0.2, y: -0.4, z: -0.5 });
    overlayProperties.alpha = 1.0;
    overlayProperties.solid = false;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    // New circles
    overlayProperties = {
        solid: true, 
        visible: true,
        type: "circle3d",
        color: AUSTIN.Colors.TronRed,
        innerAlpha: 1.0,
        outerAlpha: 0.0,
        position: Vec3.sum(center, { x: 0.2, y: 0, z: -0.5 }),
        radius: 0.1,
    };
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    overlayProperties.position = Vec3.sum(center, { x: 0.2, y: 0.4, z: -0.5 });
    overlayProperties.color = { red: 0xDA, green: 0xA5, blue: 0x20 };
    overlayProperties.radius = 0.1;
    overlayProperties.innerRadius = 0.05;
    overlayProperties.innerAlpha = 0.0;
    overlayProperties.outerAlpha = 1.0;
    overlays.push(new AUSTIN.Overlay(overlayProperties));
    overlayProperties.radius = 0.15;
    overlayProperties.innerRadius = 0.1;
    overlayProperties.innerAlpha = 1.0;
    overlayProperties.outerAlpha = 0.0;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    
    overlayProperties.color = AUSTIN.Colors.TronBlue;
    overlayProperties.position = Vec3.sum(center, { x: 0.2, y: -0.4, z: -0.5 });
    delete overlayProperties.startColor;
    delete overlayProperties.endColor;
    overlayProperties.innerRadius = 0.05;
    overlayProperties.innerAlpha = 1.0;
    overlayProperties.outerAlpha = 1.0;
    overlayProperties.startAt = 0;
    overlayProperties.endAt = 180;
    overlayProperties.innerStartColor = AUSTIN.Colors.TronBlue;
    overlayProperties.innerEndColor = { red: 0xDA, green: 0xA5, blue: 0x20 };
    overlayProperties.outerStartColor = AUSTIN.Colors.TronRed;
    overlayProperties.outerEndColor = { red: 0, green: 255, blue: 0 };
    overlayProperties.startAt = 0;
    overlayProperties.endAt = 270;
    overlays.push(new AUSTIN.Overlay(overlayProperties));

    // Lines
    overlayProperties = {
        alpha: 1.0, 
        solid: true, 
        visible: true,
        type: "line3d",
        color: AUSTIN.Colors.TronRed,
        start: Vec3.sum(center, { x: -0.2, y: 0, z: 0 }),
        end: Vec3.sum(center, { x: 0.2, y: 0, z: 0 }),
    }
    lineOverlay = new AUSTIN.Overlay(overlayProperties);

    overlayProperties.glow = 1.0;
    overlayProperties.color = AUSTIN.Colors.TronBlue;
    glowLineOverlay = new AUSTIN.Overlay(overlayProperties);
}

var start = AUSTIN.now();
function update() {
    var delta = (AUSTIN.now() - start) / 1000.0;
    var rotation = Quat.angleAxis(delta * 30.0, Vec3.UNIT_Y);
    overlays.forEach(function(overlay){
        overlay.edit({ rotation: rotation });
    });

    if (lineOverlay) {
        lineOverlay.edit({ 
            start: Vec3.sum(center, Vec3.multiplyQbyV(rotation, lineStart)),
            end: Vec3.sum(center, Vec3.multiplyQbyV(rotation, lineEnd)),
        });
    }
    
    if (glowLineOverlay) {
        glowLineOverlay.edit({ 
            start: Vec3.sum(center, Vec3.multiplyQbyV(rotation, glowLineStart)),
            end: Vec3.sum(center, Vec3.multiplyQbyV(rotation, glowLineEnd)),
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
Script.setInterval(update, 50);

