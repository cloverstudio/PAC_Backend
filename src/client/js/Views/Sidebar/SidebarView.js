var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var template = require('./SidebarView.hbs');
var SidebarView = Backbone.View.extend({
    
    views: [],
    container : "",
    srcRecent: "/images/UI/1_recent.png",
    srcGroup: "/images/UI/2_groups.png",
    srcContacts: "/images/UI/3_contacts.png",
    srcRecentOn: "/images/UI/1_recent_m_over.png",
    srcGroupOn: "/images/UI/2_groups_m_over.png",
    srcContactsOn: "/images/UI/3_contacts_m_over.png",
    initialize: function(options) {
        this.container = options.container;
        this.render();
    },

    render: function() {
        
        $(this.container).html(template({
            Config:Config,
        }));
        
        this.onLoad();
        
        return this;

    },

    onLoad: function(){
        
        var self = this;
        
        var UserListView = require('./UserList/UserListView.js');   
        var userListView = new UserListView({
            container : "#sidebar-userlist"
        });

        var GroupListView = require('./GroupList/GroupListView.js');   
        var groupListView = new GroupListView({
            container : "#sidebar-grouplist"
        });
        
        var HistoryListView = require('./HistoryList/HistoryListView.js');   
        var historyListView = new HistoryListView({
            container : "#sidebar-historylist"
        });
        
        this.views.push(userListView);
        this.views.push(groupListView);
        this.views.push(historyListView);
        
        Backbone.on(Const.NotificationUpdateUnreadCount, function(count){
            
            if(count > 0){
                $('#btn-tab-history .badge').text(count);
            }else{
                $('#btn-tab-history .badge').text("");
            }
            
        });
        
        $('#sidebar-userlist').css('display','none');
        $('#sidebar-grouplist').css('display','none');
        //$('#sidebar-historylist').css('display','none');
        
        var windowManager = require('../../lib/windowManager');
        
        $('#btn-tab-groups').unbind().on('click',function(){
            
            Backbone.trigger(Const.NotificationRefreshGroup);
            
            $('#btn-tab-users').removeClass('active');
            $('#btn-tab-history').removeClass('active');
            $('#btn-tab-groups').addClass('active');

            $('#btn-tab-users img').attr('src', self.srcContacts);
            $('#btn-tab-history img').attr('src', self.srcRecent);
            $('#btn-tab-groups img').attr('src', self.srcGroup);
            $('#btn-tab-groups img').attr('src', self.srcGroupOn);
            
            $('#sidebar-userlist').css('display','none');
            $('#sidebar-grouplist').css('display','block');
            $('#sidebar-historylist').css('display','none');

            _.debounce(function(){
                windowManager.adjustSize();
            },100)();
            
        
        });

        $('#btn-tab-users').unbind().on('click',function(){
            
            Backbone.trigger(Const.NotificationRefreshUser);
            
            $('#btn-tab-users').addClass('active');
            $('#btn-tab-history').removeClass('active');
            $('#btn-tab-groups').removeClass('active');

            $('#btn-tab-users img').attr('src', self.srcContacts);
            $('#btn-tab-history img').attr('src', self.srcRecent);
            $('#btn-tab-groups img').attr('src', self.srcGroup);
            $('#btn-tab-users img').attr('src', self.srcContactsOn);
            
            $('#sidebar-userlist').css('display','block');
            $('#sidebar-grouplist').css('display','none');
            $('#sidebar-historylist').css('display','none');
            
            _.debounce(function(){
                windowManager.adjustSize();
            },100)();
            
        });
        
        $('#btn-tab-history').unbind().on('click',function(){

            Backbone.trigger(Const.NotificationRefreshHistory);
        
            $('#btn-tab-users').removeClass('active');
            $('#btn-tab-history').addClass('active');
            $('#btn-tab-groups').removeClass('active');

            $('#btn-tab-users img').attr('src', self.srcContacts);
            $('#btn-tab-history img').attr('src', self.srcRecent);
            $('#btn-tab-groups img').attr('src', self.srcGroup);
            $('#btn-tab-history img').attr('src', self.srcRecentOn);
            
            $('#sidebar-userlist').css('display','none');
            $('#sidebar-grouplist').css('display','none');
            $('#sidebar-historylist').css('display','block');
        
            _.debounce(function(){
                windowManager.adjustSize();
            },100)();
            
        });

    },
    
    destroy: function(){
        
        _.forEach(this.views,function(view){
            
            if(view.destroy)
                view.destroy();
             
        });
        
    }
    
});

module.exports = SidebarView;
