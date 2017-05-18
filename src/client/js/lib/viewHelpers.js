var Const = require('./consts');
var Config = require('./init');

var _ = require('lodash');
var U = require('./utils.js');

var Handlebars = require('hbsfy/runtime');
Handlebars.registerHelper('test', function(context, options) {
  return options.fn(context);
});

(function(global) {
    "use strict;"

    // Class ------------------------------------------------
    function ViewHelpers() {
    };

    // Header -----------------------------------------------
    ViewHelpers.prototype.attach = attach; 

    // Implementation ---------------------------------------
    
    function attach(){
         
        Handlebars.registerHelper("l10n", function(text) {
          return  U.l10n(text);
        });
        
        Handlebars.registerHelper("groupAvatarURL", function(fileID) {
            return Config.APIEndpoint + "/file/image/group/" + fileID
        });

        Handlebars.registerHelper("formatDate", function(ut) {
          return  U.formatDate(ut,false);
        });

        Handlebars.registerHelper("yyyymmdd", function(ut) {
          return  U.formatDateyyyymmdd(ut);
        });
        
        Handlebars.registerHelper("ufDate", function(ut) {
            
            if(ut == 0 || _.isNull(ut)){
                return ""
            }
            
            return  U.formatDate(ut,true);
        });  

        Handlebars.registerHelper("makeLinkForChannel", function(identifier,type) {
            
            if(type == 'private')
                return "@" + identifier;
            else
                return "#" + identifier;
                
        });  
        
        Handlebars.registerHelper("strip", function(text,limit) {
            
          if(!text)
            return "";
          
          if(text.length <= limit)
            return text;
          
          else
            return  text.substring(0,limit) + "…";
        });
        
        Handlebars.registerHelper('condition', function(arg1,arg2,options) {
            
            if(arg1 == arg2) {
                return options.fn(this);
            }
        });

        Handlebars.registerHelper('conditionNot', function(arg1,arg2,options) {
            
            if(arg1 != arg2) {
                return options.fn(this);
            }
        });

        Handlebars.registerHelper('ifempty', function(arg1,options) {
            
            if(arg1.length == 0) {
                return options.fn(this);
            }
        });

        Handlebars.registerHelper('ifnotempty', function(arg1,options) {
            
            if(arg1.length != 0) {
                return options.fn(this);
            }
        });

        Handlebars.registerHelper('ifnotone', function(arg1,options) {
            
            if(arg1 != 1) {
                return options.fn(this);
            }
        });
        
        
        Handlebars.registerHelper('showRoomMember', function(room) {
       
            var html = "";
            var counter = 0;
            
            if(!room || !room.userModels)
                return;
                
            _.forEach(room.userModels,function(user){
                
                var src = U.getBaseURL() + "/api/v2/avatar/user/";
                
                if(counter > 4)
                    return;
                    
                if(user.avatar && user.avatar.thumbnail)
                    src += user.avatar.thumbnail.nameOnServer;
                            
                counter++;
                
                html += '<img class="img-circle" src="' + src + '"/>';
            });

            if( counter < room.usersCount){
                html += '<span class="badge">+' + ( room.usersCount - counter ) + '</span>';
            }
            
            return html;
            
        });
        
        Handlebars.registerHelper('evenodd',function(index,evenString,oddString){
            
            if(index % 2 == 0)
                return evenString;
            else
                return oddString;
            
        });
        
        Handlebars.registerHelper('spikaImageUrl',function(param){
            
           return "/spika/v1/file/download/" + param;
            
        });

        Handlebars.registerHelper('baseURL',function(param){
            
           return U.getBaseURL();
            
        });


        Handlebars.registerHelper("stripHost", function(url) {

          var URLsplit = url.split('/');
          var host = URLsplit[0] + "//" + URLsplit[2] + "/";
          var newURL = url.replace(host, '');

          return newURL;

        });

        Handlebars.registerHelper("formatDate", function(ut) {
          return  U.formatDate(ut,false);
        });

        Handlebars.registerHelper("formatTime", function(ut) {
          return  U.formatTime(ut);
        });

        Handlebars.registerHelper("formatTimeForChat", function(ut) {
          return  U.formatDate(ut,true);
        });

    }
    
    // Exports ----------------------------------------------
    module["exports"] = new ViewHelpers();

})((this || 0).self || global);