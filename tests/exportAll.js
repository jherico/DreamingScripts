var exportName = "dreaming";
var rootExportDir = "c:/users/bdavis/git/dreaming/exports2/";

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}

var exportJson = rootExportDir + "/" + exportName + ".json";
var exportAtp = rootExportDir + "/" + exportName + ".atp";
//
//var ids = Entities.findEntities(MyAvatar.position, 1000000);
//var assetUrls = {};
//for (var i = 0; i < ids.length; ++i) {
//    var id = ids[i];
//    var details = Entities.getEntityProperties(id, ["modelURL", "compoundShapeURL"]);
//    if (details.modelURL && details.modelURL.startsWith("atp:")) {
//        assetUrls[details.modelURL] = true;
//    }
//    if (details.compoundShapeURL && details.compoundShapeURL.startsWith("atp:")) {
//        assetUrls[details.compoundShapeURL] = true;
//    }
//}
//
//function mappingHandler(result) {
//    
//}
//
//assetUrls = Object.keys(assetUrls);
//print("QQQ assetUrls " + assetUrls);
//for (i = 0; i < assetUrls.length; ++i) {
//    print("URL " + assetUrls[i]);
//    (function(){
//        var assetUrl = assetUrls[i]; 
//        Assets.getMapping(assetUrls[i], function(result){
//            print("QQQ " + assetUrl + " -> " + result);
//        });
//    })();
//}

Clipboard.exportEntities(exportJson, 120, 8, 175, 100000);
Clipboard.exportAtpAssets(exportAtp);
Script.stop();
