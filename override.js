var publicPath = "https://s3.amazonaws.com/DreamingContent/";
var basePath = Script.resolvePath("..");
print("Base path " + basePath);
Resources.overrideUrlPrefix(publicPath, basePath);