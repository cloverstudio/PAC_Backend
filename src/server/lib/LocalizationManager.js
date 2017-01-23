/** Handles Localization */

var _ = require('lodash');
var Config = require('./init.js');
var querystring = require("querystring");

var langText = {
    jp: require("./lang/jp.js")
}
var LocalizationManager = {
    
    localize : function(baseString,lang){
        
        
        if(lang){
            
            var translatedText  = null;
            
            if(langText[lang]){
               
                translatedText = langText[lang][baseString];
                
            }
            
            if(translatedText)
                return translatedText;
        }
        
        return baseString;
        
    }
    
}

module["exports"] = LocalizationManager;