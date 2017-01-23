var CONST = require('../consts');
var APIClientBase = require('./ApiClientBase');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var SigninClient = require('./SigninClient');
var loginUserManager = require('../loginUserManager');
var SocketIOManager = require('../SocketIOManager');
var localStorage = require('../localstorageManager');
var UpdateRoomClient = function(){};

_.extend(UpdateRoomClient.prototype,APIClientBase.prototype);

UpdateRoomClient.prototype.send = function(
    roomId,
    name,
    description,
    file,
    success,
    progress,
    err){
          
        var self = this;
                  
        var data = new FormData()
        data.append('name',name);
        data.append('description',description);
        data.append('file', file);
        data.append('roomId', roomId);                    
        $.ajax({
            type : "POST",
            url : Config.APIEndpoint + "/room/update/",
            data : data,
            dataType: 'json',
            contentType: false,
            processData: false,
            headers: {
                "access-token":loginUserManager.getToken()
            },
            xhr: function(){
            
                var xhr = $.ajaxSettings.xhr() ;
                
                xhr.upload.addEventListener("progress", function(evt) {
                    
                    if(progress)
                        progress(evt.loaded/evt.total);
                        
                }, false);

                return xhr ;
            },
            success: function (response) {  
                                    
                if(response.code == Const.responsecodeTokenInvalid){
                    
                    self.handleInvalidToken(function(){
                        
                        self.send(roomId,
                            name,
                            description,
                            file,
                            success,
                            progress,
                            err);
                            
                    });
                        
                }else if(response.code != 1){
                    
                    err(response.code);
                    return;
                    
                } else
                    success(response);
                
            },
            error: function (e) {
                
                err(e);
            } 
        });

}

UpdateRoomClient.prototype.handleInvalidToken = function(reCallFunction){
    
    if(localStorage.get(Const.LocalStorageKeyRemember)){
        
            SigninClient.send( 
                            localStorage.get(Const.LocalStorageKeyOrganization),
                            localStorage.get(Const.LocalStorageKeyUserId),
                            localStorage.get(Const.LocalStorageKeyPassword),function(data){
                
                if(data.user && !_.isEmpty(data.newToken)){

                    loginUserManager.setUser(data.user);
                    loginUserManager.setToken(data.newToken);
                    
                    SocketIOManager.init();
                    
                    reCallFunction();
                    
                } else {
                    
                    Utils.goPage('tokenExpired');

                }
                
            },function(errCode){
                
                Utils.goPage('tokenExpired');
                
            });
            
    }else{

        Utils.goPage('tokenExpired');   

    }

}

// returns instance
module["exports"] = new UpdateRoomClient();

