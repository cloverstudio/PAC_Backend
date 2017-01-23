var _ = require('lodash');
var Backbone = require('backbone');

var GetDictionaryClient = require('./APIClients/GetDictionaryClient');

var localzationManager = {

    dictionary : null,
    fetchDictionary: function(callBack){
        
        var self = this;
        
        GetDictionaryClient.send(function(data){
            
            self.dictionary = data;
            
            callBack();
            
        },function(err){
            
            console.log(err);
            
            callBack();
            
        });
        
    },
    get: function(text){
        
        if(this.dictionary && this.dictionary[text])
            return this.dictionary[text];
        
        return text;
        
    }
    
}

module["exports"] = localzationManager;
