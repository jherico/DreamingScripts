(function(){
    var SHADER_URL = Script.resolvePath("./quorraTest.fs");
    var USER_DATA = { 
        ProceduralEntity: {
            version: 2,
            shaderUrl: SHADER_URL,
            uniforms: { iSpeed: 1.0, iShell: 1.0 }
        } 
    };
    
    var POSITION = { x: 0, y: 0.5, z: -1 };
    POSITION = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, POSITION));
    print("QQQ position " + POSITION.x + " " + POSITION.y + " " + POSITION.z)
    var SIZE = 0.5;
    var id = Entities.addEntity({
        name: "QuorraTest",
        type: "Sphere",
        position: POSITION,
        lifetime: 30,
        color: { red: 255, green: 255, blue: 255 },
        ignoreCollisions: true,
        collisionsWillMove: false,
        dimensions: { x: SIZE, y: SIZE, z: SIZE },
        userData: JSON.stringify(USER_DATA)
    });
    
    print("QQQ id " + id)
})();
    
//Script.stop();