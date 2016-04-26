QuorraBall = function() {};
QuorraBall.prototype.SIZE = 0.5;
QuorraBall.prototype.SHELLS = 14;
QuorraBall.prototype.INTENSITY_INCREMENT = 1.0 / (QuorraBall.SHELLS + 1);
QuorraBall.prototype.SIZE_INCREMENT = QuorraBall.SIZE * QuorraBall.INTENSITY_INCREMENT;
QuorraBall.prototype.NAME = "QuorraBall";
QuorraBall.prototype.POSITION = { x: 0, y: 0.5, z: -2.5 }; 
QuorraBall.prototype.COLOR = { red: 220, green: 220, blue: 220 };
QuorraBall.prototype.USER_DATA = { ProceduralEntity: {
        version: 2,
        shaderUrl: "https://s3.amazonaws.com/Oculus/shadertoys/quora2.fs",
        uniforms: { iSpeed: 1.0, iShell: 1.0 }
} };

// Clear any previous entities within 50 meters
QuorraBall.prototype.clear = function() {
    var ids = Entities.findEntities(MyAvatar.position, 50);
    var that = this;
    ids.forEach(function(id) {
        var properties = Entities.getEntityProperties(id);
        if (properties.name == that.NAME) {
            Entities.deleteEntity(id);
        }
    }, this);
}

QuorraBall.prototype.createBall = function(i) {
    var that = this;
    var intensity = 1.0 / (this.SHELLS + 1);
    var increment = this.SIZE * intensity;
    var size = that.SIZE - i * increment;
    var userData = JSON.parse(JSON.stringify(that.USER_DATA));
    userData.ProceduralEntity.uniforms.iShell = 1.0 - i * intensity;
    var currentSize = 0.05;
    var id = Entities.addEntity({
        type: "Sphere",
        position: Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, that.POSITION)),
        name: that.NAME,
        color: that.COLOR,
        ignoreCollisions: true,
        collisionsWillMove: false,
        dimensions: { x: currentSize, y: currentSize, z: currentSize },
        userData: JSON.stringify(userData)
    });
    var updateSize = function(){
        var difference = size - currentSize;
        var newSize = size;
        if (difference > 0.005) {
            newSize = currentSize + difference * 0.1;
        }
        currentSize = newSize;
        Entities.editEntity(id, { dimensions: { x: currentSize, y: currentSize, z: currentSize } });
        if (difference > 0.005) {
            Script.setTimeout(updateSize, 10);
        }
    };
    Script.setTimeout(updateSize, i * 500);
}

QuorraBall.prototype.create = function() {
    for (var i = this.SHELLS - 1; i >= 0; --i) {
        this.createBall(i);
    }
}

var quorraBall = new QuorraBall();
quorraBall.clear();
quorraBall.create();