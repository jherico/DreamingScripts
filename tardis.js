//
//  fish.js
//  examples
//
//  Created by Eric Levin on 8 Jan 2016
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
Script.include([ HIFI_PUBLIC_BUCKET + "scripts/libraries/toolBars.js" ]);
var IMAGE_URL = Script.resolvePath("../images/fish.svg");
var QML_URL = Script.resolvePath("../qml/fish.qml");

var fishWindow = new OverlayWindow({
    source: QML_URL, 
    width: 128, height: 128,
    visible: false
});

var toolHeight = 50;
var toolWidth = 50;

function toggleFish() {
    if (fishWindow.visible) {
        fishWindow.setVisible(false);
    } else {
        fishWindow.setVisible(true);
        fishWindow.setPosition(0, 0);        
    }
}

var toolBar = (function() {
    var that = {}, toolBar, browseFishButton;
    function initialize() {
        ToolBar.SPACING = 16;
        toolBar = new ToolBar(0, 0, ToolBar.VERTICAL, "highfidelity.fish.toolbar", function(windowDimensions, toolbar) {
            return {
                x: windowDimensions.x - 8 - toolbar.width,
                y: 135
            };
        });
        browseFishButton = toolBar.addTool({
            imageURL: IMAGE_URL,
            width: toolWidth,
            height: toolHeight,
            alpha: 0.9,
            visible: true,
        });

        toolBar.showTool(browseFishButton, true);
    }

    var browseFishButtonDown = false;
    that.mousePressEvent = function(event) {
        var clickedOverlay,
            url,
            file;

        if (!event.isLeftButton) {
            // if another mouse button than left is pressed ignore it
            return false;
        }

        clickedOverlay = Overlays.getOverlayAtPoint({
            x: event.x,
            y: event.y
        });



        if (browseFishButton === toolBar.clicked(clickedOverlay)) {
            toggleFish();
            return true;
        }

        return false;
    };

    that.mouseReleaseEvent = function(event) {
        var handled = false;
        if (browseFishButtonDown) {
            var clickedOverlay = Overlays.getOverlayAtPoint({
                x: event.x,
                y: event.y
            });
        }
        browseFishButtonDown = false;
        return handled;
    }

    that.cleanup = function() {
        toolBar.cleanup();
    };

    initialize();
    return that;
}());

Controller.mousePressEvent.connect(toolBar.mousePressEvent)
Script.scriptEnding.connect(toolBar.cleanup);
