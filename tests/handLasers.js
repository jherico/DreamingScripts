var LEFT_HUD_LASER = 1;
var RIGHT_HUD_LASER = 2;
var BOTH_HUD_LASERS = LEFT_HUD_LASER + RIGHT_HUD_LASER;
var LASER_ALPHA = 0.5;
var LASER_SEARCH_COLOR_XYZW = {x: 10 / 255, y: 10 / 255, z: 255 / 255, w: LASER_ALPHA};
var LASER_TRIGGER_COLOR_XYZW = {x: 250 / 255, y: 10 / 255, z: 10 / 255, w: LASER_ALPHA};
var SYSTEM_LASER_DIRECTION = {x: 0, y: 0, z: -1};

function init() {
    HMD.setHandLasers(LEFT_HUD_LASER, true, LASER_SEARCH_COLOR_XYZW, SYSTEM_LASER_DIRECTION);
    HMD.setHandLasers(RIGHT_HUD_LASER, true, LASER_TRIGGER_COLOR_XYZW, SYSTEM_LASER_DIRECTION);
}
function cleanup() {
    HMD.disableHandLasers(BOTH_HUD_LASERS);
}

init();
Script.scriptEnding.connect(cleanup);
