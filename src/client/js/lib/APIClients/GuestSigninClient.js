var _ = require('lodash');
var async = require('async');

var Const = require('../consts');
var Config = require('../init');
var Utils = require('../utils');

var GuestSigninClient = function(){};

GuestSigninClient.prototype.send = function(organization,userid,success,error){

    async.waterfall([
        function(done){
            var result = {};

            $.ajax({
                type: 'GET',
                url: Config.APIEndpoint + "/test",
                success: function(response) {
                
                    if(response.code != 1){
                        done(response.code,result);
                        return;
                    }
                    
                    result.testResponseData = response;
                    
                    done(null,result);
                    
                },
                error: function() {
                    done("unknoun error",result);
                }
            });
            
        },
        function(result,done){
            
            var secret = Utils.createSecret(result.testResponseData.time);
            
            $.ajax({
                type: 'POST',
                url: Config.APIEndpoint + "/user/signin/guest",
                data: JSON.stringify({
                	organizationid:organization,
                    userid:userid,
                    secret:secret
                }),
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: function(response) {
                
                    if(response.code != 1){
                        
                        done(response.code,result);
                        return;
                    }
                    
                    result.responseData = response.data;
                    done(null,result);
                },
                error: function() {
                    done("unknoun error",result);
                }
            });
    
        }
    ],
        function(err,result){

            if(err){
                if(_.isFunction(error)){
                    error(err);
                    return;
                }
            }
                
            success(result.responseData);
            
    });

}
    
// returns instance
module["exports"] = new GuestSigninClient();
