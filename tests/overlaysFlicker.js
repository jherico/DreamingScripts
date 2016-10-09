Script.include("../Austin.js");

var TARGET_MODEL_URL = Script.resolvePath("./teleport-destination.fbx");
var TOO_CLOSE_MODEL_URL = Script.resolvePath("./teleport-cancel.fbx");
var TARGET_MODEL_DIMENSIONS = {
    x: 1.15,
    y: 0.5,
    z: 1.15
};


AUSTIN.TestTeleporter = function() {
    var that = this;
    this.distance = -1.5;
    this.offset = {x: 0, y: 0.5, z: -2 };

    this.createTargetOverlay = function() {
        that.deleteTargetOverlay();
        var targetOverlayProps = {
            url: TARGET_MODEL_URL,
            dimensions: TARGET_MODEL_DIMENSIONS,
            visible: true
        };
        targetOverlayProps.position = Vec3.sum(
                AUSTIN.avatarRelativePosition(that.offset), 
                { x: 0.5, y: 0.0, z: that.distance });
        
        that.targetOverlay = Overlays.addOverlay("model", targetOverlayProps);
    }

    this.createCancelOverlay = function() {
        that.deleteCancelOverlay();
        var cancelOverlayProps = {
            url: TOO_CLOSE_MODEL_URL,
            dimensions: TARGET_MODEL_DIMENSIONS,
            visible: true
        };
        cancelOverlayProps.position = Vec3.sum(
                AUSTIN.avatarRelativePosition(that.offset), 
                { x: -0.5, y: 0.0, z: that.distance });
        that.cancelOverlay = Overlays.addOverlay("model", cancelOverlayProps); 
    }
    
    this.deleteTargetOverlay = function() {
        if (that.targetOverlay === null) {
            return;
        }

        Overlays.deleteOverlay(that.targetOverlay);
        that.targetOverlay = null;
    }
    
    this.deleteCancelOverlay = function() {
        if (that.cancelOverlay === null) {
            return;
        }

        Overlays.deleteOverlay(that.cancelOverlay);
        that.cancelOverlay = null;
    }
    
    this.toggleOverlays = function() {
        if (that.cancelOverlay == null) {
            if (that.distance > 15.0) {
                that.distance -= 1.0; 
            } else {
                that.distance = -1.5;
            }
            that.createCancelOverlay();
            that.createTargetOverlay();
        } else {
            that.deleteTargetOverlay();
            that.deleteCancelOverlay();
        }
    }
    
    this.update = function() {
        that.toggleOverlays();
    }

    this.destroy = function() {
        that.deleteTargetOverlay();
        that.deleteCancelOverlay();
    }
    
    Script.scriptEnding.connect(function() {
        that.destroy();
    });
    
    Script.setInterval(function(){
        that.update();
    }, 500);


    return this;
}

var test = new AUSTIN.TestTeleporter();



