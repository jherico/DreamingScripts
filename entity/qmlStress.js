(function(){
    var _this;
    var accumulator = 0;
    var interval = 0.5 * Math.random() + 0.5; 
    var overlay = 0;
    
    StressQml = function() {
        _this = this;
        return _this;
    };

    StressQml.prototype = {
        constructor: StressQml,
        
        updateOverlay: function() {
            if (overlay) {
                Overlays.deleteOverlay(overlay);
            }
            overlay = Overlays.addOverlay("text", {
                x: Math.random() * 1800,
                y: Math.random() * 900,
                width: 100,
                height: 50,
                backgroundColor: { red: 0, green: 0, blue: 0},
                color: { red: 255, green: 255, blue: 255},
                topMargin: 4,
                leftMargin: 4,
                text: Math.floor(Math.random() * 1000),
                alpha: 1,
                backgroundAlpha: 0.5
            });
        },
        
        update: function(delta) {
            accumulator += delta;
            if (accumulator > interval) {
                accumulator = 0;
                _this.updateOverlay();
            }
        },
        
        preload: function(entityID) {
            print("preload");
            Script.update.connect(this.update);
            _this.updateOverlay()
            print("Overlay box " + overlay);
        },
        
        unload: function(entityId) {
            print("unload");
            Overlays.deleteOverlay(overlayBox);
        },
    };

    return new StressQml();
});


