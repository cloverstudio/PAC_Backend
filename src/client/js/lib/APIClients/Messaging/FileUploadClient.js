var _ = require('lodash');

var CONST = require('../../consts');
var APIClientBase = require('../ApiClientBase');
var Conf = require('../../init');
var loginUserManager = require('../../loginUserManager');

var FileUploadClient = function(){};

_.extend(FileUploadClient.prototype,APIClientBase.prototype);

FileUploadClient.prototype.send = function(file,progress,success,err){

    var self = this;
    
    var headers = {};
    var accessToken = loginUserManager.getToken();
    if(accessToken)
        headers['access-token'] = accessToken;
    
    var data = new FormData();
    
    data.append('file', file);
    
    $.ajax({
        type : "POST",
        url : Conf.APIEndpoint + "/file/upload",
        data : data,
        contentType: false,
        processData: false,
        //headers: header,
        xhr: function(){
        
            var xhr = $.ajaxSettings.xhr() ;
            
            xhr.upload.addEventListener("progress", function(evt) {
            
                if(progress)
                    progress(evt.loaded/evt.total);
                    
            }, false);

            return xhr ;
        },
        success: function (response) {  
            
            if(response.code != 1){
                
                if(_.isFunction(error))
                    error(response.code);
                
                return;

            }
            
            if(_.isFunction(success)){
                success(response.data);
            }
            
        },
        error: function (e) {
            console.log(e.statusText);

            if(_.isFunction(err)){
                err();
            }
        } 
    });

}
    // returns instance
module["exports"] = new FileUploadClient();