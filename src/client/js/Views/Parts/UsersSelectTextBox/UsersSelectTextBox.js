var $ = require('jquery');
var _ = require('lodash');

var Utils = require('../../../lib/utils.js');

var UserSearchClient = require('../../../lib/APIClients/UserSearchClient');

var template = require('./UsersSelectTextBox.hbs');
var templateSelect = require('./SelectPanel.hbs');
var templateSelectContent = require('./UsersSelectContents.hbs');

var UsersSelectTextBox = function(selector,freezeUsers){
    
    // define variables here
    this.identifier = Utils.getRandomString(32);
    this.identifierSel = "#" + this.identifier;
    this.selector = selector;
    this.selectedUsers = [];
    this.freezeUsers = freezeUsers;
    
    this.render();

    this.attachEvents();
    
}

UsersSelectTextBox.prototype.remove = function(selector){
    $(this.identifierSel).remove();
}


UsersSelectTextBox.prototype.$ = function(selector){
    return $(this.selector + " " + selector)
}

UsersSelectTextBox.prototype.attachEvents = function(){
    
    var self  = this;

}

UsersSelectTextBox.prototype.showCandidate = function(keyword){
    
    var self = this;
    
    var isShowed = !_.isUndefined($(this.identifierSel)[0]);
    
    if(keyword.length == 0){
        $(this.identifierSel).remove();
        return;
    }
    
    if(isShowed){
        
        
        
    }else{
        
        $('body').append(templateSelect({
            identifier: this.identifier
        }));
        
        var offset = this.$("input").offset();
        var height = this.$("input").outerHeight();
        
        $(this.identifierSel).css('top',offset.top + height + 5);
        $(this.identifierSel).css('left',offset.left);

    }
    
    UserSearchClient.send(keyword,1,function(data){
        
        var noUser = null;
        
        if(!_.isEmpty(data.list)){

            noUser = 1;
            
        }else{

        }
        
        var filtered = _.filter(data.list,function(row){
            
            var find = _.find(self.selectedUsers,function(row2){
                
                return row._id == row2._id;
                 
            });

            return _.isUndefined(find);
                
        });
        
        var html = templateSelectContent({
            list: filtered,
            nouser: noUser
        });
        
        $(self.identifierSel).html(html);
        
        $(self.identifierSel + " li").on('click',function(){
            var id = $(this).attr('id');
            
            var userObj = _.find(filtered,function(row){
                return row._id == id;
            })
            
            if(userObj)
                self.selectUser(userObj);
            
        });
            
    },function(errorCode){
        
        
        
    });
    
}

UsersSelectTextBox.prototype.render = function(){
    
    var self = this;
    
    this.selectedUsers = _.map(this.selectedUsers,function(selectedUsers){
        
        if(self.freezeUsers && self.freezeUsers.indexOf(selectedUsers._id) != -1)
            selectedUsers.freeze = true;
            
        return selectedUsers;
            
    });

    
    $(this.selector).html(template({
        identifier: this.identifier,
        selectedUsers: this.selectedUsers,
        freezeUsers: this.freezeUsers
    }));

    this.$("input").on('keyup',function(){
        
        var keyword = $(this).val();
        
        self.showCandidate(keyword);
         
    });
    
    this.$(".selected-users-row.active").unbind().on('click',function(){
        
        var id = $(this).attr('uid');
        
        var userObj = _.find(self.selectedUsers,function(row){
            return row._id == id;
        })
        
        if(userObj)
            self.removeUser(userObj);
         
    });
    
}

UsersSelectTextBox.prototype.selectUsers = function(arrayUserObj){
    
    var self = this;
    
    _.forEach(arrayUserObj,function(userObj){
        self.selectedUsers.push(userObj);  
    });
    
    $(this.identifierSel).remove();
    
    this.render();
    
}

    
UsersSelectTextBox.prototype.selectUser = function(userObj){
    
    this.selectedUsers.push(userObj);  
    $(this.identifierSel).remove();
    
    this.render();
    
}

UsersSelectTextBox.prototype.removeUser = function(userObj){
    
    var removedList = _.filter(this.selectedUsers,function(user){
        
        return user._id != userObj._id
            
    });
    
    this.selectedUsers = removedList;
    
    $(this.identifierSel).remove();
    
    this.render();
    
}


module.exports = UsersSelectTextBox;