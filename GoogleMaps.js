
Google = {
    KEY: "AIzaSyDJmgU7Dtgqc-bnLeEcRwJAgRxRCsPOMbQ",
    URL: "https://maps.googleapis.com/maps/api/staticmap",
}



Google.Map = function(properties) {
    this.center = properties.center || { x: 0, y: 0, z: 0 };
    this.id = Overlays.addOverlay(type, properties);
    this.destroyWithScript = true;
    var that = this;

    Script.scriptEnding.connect(function(){
        if (that.destroyWithScript) {
            that.destroy();
        }
    });
    
    return this;
};


Google.Map.prototype = {
    constructor: Google.Map,
    // https://maps.googleapis.com/maps/api/staticmap?center=47.45,-122.3&zoom=&size=256x256&maptype=roadmap&style=feature:poi|element:labels|visibility:off&style=feature:road.arterial|element:labels|visibility:off&key=AIzaSyDJmgU7Dtgqc-bnLeEcRwJAgRxRCsPOMbQ
};





