    // Grab the standard controller names
    var xbox = Controller.Controllers.Standard;
Analog values:
    LX, LY, RX, RY -> [-1, 1]
    LT, RT -> [0, 1]

Buttons: 
    LS, RS, (analog stick press)
    LB, RB, (shoulder buttons...) 
    DPadUp, DPadDown, DPadLeft, DPadRight, (aliases DU, DD, DL, DR)
    X, Y, A, B, 
    Back, Start, Guide 
    // Poses: LeftPose, RightPose

    var actions = Controller.Controllers.Actions;
    // Yaw, Pitch, Roll, Context, 

    // override default mapping for standard controller -> action... 
    // ex:  invert the pitch on the right analog stick
    {
        var mapping = Controller.newMapping();
        mapping.from(xbox.RY).invert().to(xbox.RY);
        // Not really needed assuming this is the default mapping
        // mapping.mapToAction(xbox.RY, actions.PITCH);
        // Enable this mapping
        Controller.enableMapping(mapping);
        // Restore default behavior
        Controller.disableMapping(mapping);
        // OR?
        Controller.pushMapping(mapping);
        Controller.popMapping();
    }


    // override default mapping for standard controller with a function... 
    // ex: fire a bullet when I press a trigger (trigger goes from 0 -> non-zero, 
    // but not when the trigger goes from non-zero -> non-zero
    {
        var mapping = Controller.newMapping();
        //Forces the controller to only report 0 or 1 for the 
        mapping.constrainToBoolean(xbox.RT);
        mapping.mapToFunction(xbox.RT, function(value) {
            if (value) {
                Entity.createEntity(bullet);
            }
        });
        // Also consider this, which would be more useful for an analog stick that 
        // would normally range from -1 to 1
        // mapping.constrainToInteger(xbox.RX);
        
        // Enable and disable as above
    }
    
    // mapping of native -> action... 
    // ex: connect the Hydra middle button to "Open context menu" (full menu navigation optional)
    var hydra = Controller.Controllers.Hydra;
    {
        var mapping = Controller.newMapping();
        mapping.map(hydra.LeftButton0, actions.ContextMenu);
        mapping.map(hydra.LeftButton0).to(xbox.RT);
        mapping.from(xbox.RT).constrainToBoolean().invert().to(actions.Foo)
        mapping.from(xbox.RY).invert().deadZone(0.2).to(actions.Pitch)
        mapping.from(xbox.RY).filter(function(newValue, oldValue){
            return newValue * 2.0
        }).to(actions.Pitch)
        
        mapping.from(function(time){
            return Math.cos(time);
        }).to(actions.Pitch);

        mapping.mapFromFunction(function(){
            return x;
        }, actions.ContextMenu);

        mapping.from(xbox.LY).clamp(0, 1).to(actions.Forward);
        mapping.from(xbox.LY).clamp(-1, 0).to(actions.Backward);
        mapping.from(xbox.RY).clamp(0, 1).to(actions.Forward);
        mapping.from(xbox.RS).to();
        mapping.from(xbox.ALL).to();
        
        mapping.from(xbox.RY).to(function( ... ){ ... });
        mapping.from(xbox.RY).pass();
        
        mapping.suppress() ≅ mapping.to(null)
        mapping.pass() ≅ mapping.to(fromControl)

        mapping.from(keyboard.RightParen).invert().to(actions.Yaw)
        mapping.from(keyboard.LeftParen).to(actions.Yaw)
        
        mapping.from(hydra.LX).pulse(MIN_SNAP_TIME, 3.0).to(Actions.Yaw)
        
        mapping.from(keyboard.LeftParen).pulse(MIN_SNAP_TIME).to(Actions.Yaw)
        // Enable and disable as above
       
mappingSnap.from(hydra.LX).to(function(newValue, oldValue){
    timeSinceLastYaw += deltaTime
    if (timeSinceLastYaw > MIN_SNAP_TIME) {
        pulse(actions.Yaw, 3.0);
        timeSinceLastYaw = 0;
    } 
});

action.YawRate
pulse(actions.Yaw, 3.0);

    
    
    void updateCamera() {
        float currentYaw = Actions.getValue(Actions.YAW);
        float turnRadians = 0.0f;
        if (Hmd.isActive() && Menu.isEnabled(MenuItem.ComfortMode)) {
            if (currentYaw > 0.0) {
                // Check time since last camera update
                // if enough time as passed
                turnRadians = SNAP_YAW_VALUE;
            }
        } else {
            turnRadians = something something currentYaw something;
        }
    }

    

// mapping of native -> JS function... 
// ex:  when I press a button on the hydra, it brings up an overlay created in JS, and I can move the overlay with the analog stick until I press the button again

    
// map multiple inputs to one output with varying behavior... 
// ex:  'Left Shoulder + Right Shoulder' -> YAW one button yaws left, one button yaws right

//    * Create a custom mapping for standard input 'Left Shoulder + Right Shoulder' -> YAW Action, by allowing the connection to invert the yaw value for the left shoulder input.
//
//    * Create a custom mapping that allows an advanced user to have smooth Yaw movement even when in HMD mode.
//
//    * Create a mapping that switches between smooth and step yaw when switching between desktop vs HMD mode
//
//    * Implement an entity script that captures the analog joysticks when the user "activates" an arcade game in world and uses the analog joystick to control the game.
//    
// Allow the caller to enumerate native devices attached to the system, as well as
// enumrate their native inputs.
