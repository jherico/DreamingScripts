Script.include("../Austin.js");
Script.include("../noise/perlin.js");

(function() {
    var start = AUSTIN.now();
    var entities = [];
    var center = AUSTIN.avatarRelativePosition({x: 0, y: 1, z: -1 });
    
    function update() {
        
    }
    
    function init() {
        
    }
    
    function cleanup() {
        
    }

    init();
    Script.scriptEnding.connect(cleanup);
    Script.setInterval(update, 50);
})()

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

