var _ = require('lodash');
var Backbone = require('backbone');

var localstorageManager = {


    isEnabled: false,
    init: function(){

        if(typeof(Storage) !== "undefined") {
            this.isEnabled = true;
        } else {
            this.isEnabled = false;
        }
    },

    set: function(key,value){
        
        if(!this.isEnabled)
            return;
            
        //if(_.isObject(value))
        //    value = JSON.stringify(value);
        
        localStorage.setItem(key, value);
        
    },

    get: function(key){
        
        if(!this.isEnabled)
            return null;
            
        var value = localStorage.getItem(key);
        //var valueObj = JSON.parse(value);
        
        //if(_.isObject(valueObj))
        //    return valueObj;
        //else
            return value;
        
    },
    
    del: function(key){

        if(!this.isEnabled)
            return null;
            
        localStorage.removeItem(key);
        
    }
    
}

module["exports"] = localstorageManager;
