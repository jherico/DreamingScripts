var QML_URL = Script.resolvePath("../qml/OverlayTest.qml");
var qmlWindow = new OverlayWindow({
    source: QML_URL, 
    width: 128, height: 128,
    visible: false,
});
qmlWindow.setPosition(30, 30);
qmlWindow.setVisible(true);
qmlWindow.visibleChanged.connect(function(){
    print("test window visible changed to " + qmlWindow.visible)
})
