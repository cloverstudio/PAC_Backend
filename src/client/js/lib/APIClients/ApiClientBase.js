var JSON = require('JSON2');
var _ = require('lodash');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var SigninClient = require('./SigninClient');
var loginUserManager = require('../loginUserManager');
var SocketIOManager = require('../SocketIOManager');
var localStorage = require('../localstorageManager');

(function(global) {
    "use strict;"

    var APIClientBase = function(){}
    
    APIClientBase.prototype.getRequst = function(urlPrefix,success,error){
        
        var self = this;
        
        var headers = {};
        var accessToken = loginUserManager.getToken();
        if(accessToken)
            headers['access-token'] = accessToken;
                        
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: Config.APIEndpoint + urlPrefix,
            dataType: 'json',
            headers: headers,
            success: function(response) {
            
                if(response.code != 1){
                    
                    if(response.code == Const.responsecodeTokenInvalid){
                        
                        self.handleInvalidToken(function(){
                            
                            self.getRequst(urlPrefix,success,error);
                                
                        });
                         
                    }else if(_.isFunction(error)){
                        error(response.code);
                    }
                    
                    return;
                }
                
                if(_.isFunction(success)){
                    success(response.data);
                }
            },
            error: function() {
                if(_.isFunction(error)){
                    error();
                }
            }
        });
        
    }

    APIClientBase.prototype.postRequst = function(urlPrefix,data,success,error){
        
        var self = this;
        
        var headers = {};
        var accessToken = loginUserManager.getToken();
        if(accessToken)
            headers['access-token'] = accessToken;
            
        $.ajax({
            type: 'POST',
            crossDomain: true,
            url: Config.APIEndpoint + urlPrefix,
            data: JSON.stringify(data),
            dataType: 'json',
            headers: headers,
            contentType: "application/json; charset=utf-8",
            success: function(response) {
            
                if(response.code != 1){
                    
                    if(response.code == Const.responsecodeTokenInvalid){
                        
                        self.handleInvalidToken(function(){
                            
                            self.postRequst(urlPrefix,data,success,error);
                                
                        });
                         
                    }else if(_.isFunction(error)){
                        error(response.code);
                    }
                    
                    return;
                }
                
                if(_.isFunction(success)){
                    success(response.data);
                }
            },
            error: function() {
                if(_.isFunction(error)){
                    error();
                }
            }
        });
        
    }
    
    APIClientBase.prototype.handleInvalidToken = function(reCallFunction){
        
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
    module["exports"] = APIClientBase;

})((this || 0).self || global);