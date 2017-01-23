/** Generate this document */

var glob = require( 'glob' );  
var path = require('path');
var async = require('async');
var _ = require('lodash');
var fs = require('fs-extra');

var baseDir = path.resolve(__dirname, "../", "");;
var extensions = ["js"];
var depthLevel = 10;

var ExplanationFileName = "_dirDoc.txt";

async.waterfall([(done) => {

    glob( baseDir + "/**", function( err, files ) {

        var result = {};

        result.output = [];

        result.files = files;
        done(err,result)

    });
    
},(result,done) => {

    _.each(result.files,function(path){

        var fileStats = fs.statSync(path);
        var pathFromBaseDir = path.replace(baseDir,"");

        // check dir explanation file
        if(fileStats.isDirectory()){

            var explanationFile = path + "/" + ExplanationFileName;

            if(fs.existsSync(explanationFile)){

                var depthTemp = pathFromBaseDir.split("/");
                var depth = depthTemp.length;
                var pathName = depthTemp[depthTemp.length - 1];

                var fileContent = fs.readFileSync(explanationFile,'utf8');

                for(var i = 0 ; i < depth ; i++){

                    pathName = "\t" + pathName;

                }

                for(var i = 0 ; i < depthLevel-depth ; i++){

                    pathName = pathName + "\t";

                }

                result.output.push({
                    file:pathName,
                    explanation:  "(DIR)  "  +  fileContent
                });
                
            }

        }else{

            var extensionTemp = path.split('.');
            var extension = extensionTemp[extensionTemp.length - 1];

            if(extensions.indexOf(extension) != -1){
                
                var fileContent = fs.readFileSync(path,'utf8');

                var regex = /^\/\*\*(.*?)\*\//mg
                var regexResult = fileContent.match(regex);

                if(regexResult && regexResult.length > 0){

                    var matchString = regexResult[0]
                    var text = matchString.replace("/**","").replace("*/","").trim();

                    var depthTemp = pathFromBaseDir.split("/");
                    var depth = depthTemp.length;
                    var pathName = depthTemp[depthTemp.length - 1];

                    for(var i = 0 ; i < depth ; i++){

                        pathName = "\t" + pathName;

                    }
                    
                    for(var i = 0 ; i < depthLevel-depth ; i++){

                        pathName = pathName + "\t";

                    }

                    result.output.push({
                        file: pathName,
                        explanation: text
                    });

                }
            }

        }

        done(null,result);

    });

    

}],
(err,result) => {

    if(err){
        console.log('failed');
    }else{
        
        _.each(result.output,function(row){
            console.log(row.file + "\t" + row.explanation);
        });

    }

});

