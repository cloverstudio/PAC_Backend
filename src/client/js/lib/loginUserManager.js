
var _ = require('lodash');

var Const = require('./consts');
var Utils = require('./utils');

var loginUserManager = {
    
    user : null,
    organization: null,
    token : null,
    currentConversation : null,
    currentGroup : null,
    currentRoom : null,
    currentUser : null,
    setUser : function(user){
        
        this.user = user;
        
        
    },

    setToken : function(token){
        
        this.token = token;
                
    },
        
    getUser : function(){
        
        return this.user;
        
    },

    getToken : function(){
        
        return this.token;
        
    },
    
    openChat : function(obj){
        
        this.currentGroup = null;
        this.currentRoom = null;
        this.currentUser = null;
        
        if(obj.user)
            this.currentUser = obj.user;
        
        if(obj.room)
            this.currentRoom = obj.room;
            
        if(obj.group)
            this.currentGroup = obj.group;
            
    }

}

module["exports"] = loginUserManager;