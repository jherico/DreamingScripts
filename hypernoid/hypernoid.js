//var QML_URL = Script.resolvePath("../qml/OverlayTest.qml");
//
//var qmlWindow = new OverlayWindow({
//    source: QML_URL, 
//    width: 128, height: 128,
//    visible: false,
//});
//qmlWindow.setPosition(30, 30);
//qmlWindow.setVisible(true);

Script.include("../Austin.js");

AUSTIN.HYPERNOID = {}

function hypernoid(){
    var that = {};
    
    return that;
};


var hypernoidInstance = hypernoid();
Script.scriptEnding.connect(function(){
    hypernoidInstance.destroy();
    hypernoidInstance = null;
});
