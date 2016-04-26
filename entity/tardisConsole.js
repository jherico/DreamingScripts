(function() {
    var that;

    // this is the "constructor" for the entity as a JS object we don't do much here, but we do want to remember
    // our this object, so we can access it in cases where we're called without a this (like in the case of various global signals)
    TardisConsole = function() { that = this; };

    // update() will be called regulary, because we've hooked the update signal in our preload() function.
    // we will check the avatars hand positions and if either hand is in our bounding box, we will notice that
    TardisConsole.prototype.update = function {
        // because the update() siRgnal doesn't have a valid this, we need to use our memorized that to access our entityID
        var entityID = that.entityID;
    };

    // preload() will be called when the entity has become visible (or known) to the interface
    // it gives us a chance to set our local JavaScript object up. In this case it means:
    //   * remembering our entityID, so we can access it in cases where we're called without an entityID
    //   * connecting to the update signal so we can check our grabbed state
    TardisConsole.prototype.preload = function(entityID) {
        print("preload!");
        this.entityID = entityID;
        Script.update.connect(this.update);
    };

    // unload() will be called when our entity is no longer available. It may be because we were deleted,
    // or because we've left the domain or quit the application. In all cases we want to unhook our connection
    // to the update signal
    TardisConsole.prototype.unload = function(entityID) {
        Script.update.disconnect(this.update);
    };

    // entity scripts always need to return a newly constructed object of our type
    return new TardisConsole();
})
