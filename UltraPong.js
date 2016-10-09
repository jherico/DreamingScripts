/* globals Script, AUSTIN, UltraPong:true
 */

"use strict";

// import AUSTIN from 'Austin';
Script.include("./Austin.js");

UltraPong = {};

UltraPong.Board = function (properties) {
    properties = properties || {};
    this.size = properties.size || { x: 8, y: 8, z: 20 };
    this.center = properties.center || AUSTIN.avatarRelativePosition({ x: 0, y: -1.2, z: -2 });
    // var tardisLocation = 

    return this;
};

UltraPong.Board.prototype = {
    
};

var board = new UltraPong.Board({});
print("")
Script.stop();