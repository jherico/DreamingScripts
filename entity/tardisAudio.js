(function(){
    AudioConsole = function () {
    }
    
    AudioConsole.prototype = {
        constructor: AudioConsole,

        preload: function(entityID) {
            print("preload for " + entityID);
            var QML_URL = "https://s3.amazonaws.com/DreamingContent/qml/TardisAudio.qml";
            print("Loading QML from " + QML_URL);
            this.entityID = entityID;
            this.window = new OverlayWindow({
                source: QML_URL, 
                width: 128, height: 128,
                visible: true
            });
        },
        
        unload: function(entityID) {
            print("unload " + entityID);
            this.window.close();
        },
    };
    
    return new AudioConsole();
});
