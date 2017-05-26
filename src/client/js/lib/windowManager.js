var Const = require('./consts');
var _ = require('lodash');
var U = require('./utils.js');
var Backbone = require('backbone');

var windowManager = {


    isActive: true,
    init: function(){

        var self = this;

        Backbone.on(Const.NotificationUpdateWindowSize,function(obj){
            self.adjustSize();
        });

        $(window).resize(function() {
            self.adjustSize();
        });
        
        $(window).focus(function() {
            self.isActive = true;
        });

        $(window).blur(function() {
            self.isActive = false;
        });
        
    },

    adjustSize: function(){
        
        var height = $(window).height();
        var width = $(window).width();

        var headerHeight = $("#header").outerHeight();

        var showHeader = U.getQueryParamByName('header');
        if(showHeader == 'no'){
            headerHeight = 0;
        }
            
        $("#sidebar").height(height - headerHeight);
        $("#main-container").height(height - headerHeight);
        //$("#callingview").height(height - headerHeight);
        
        $("#webhook-container").height(height - headerHeight);
        
        // sidebar
        var searchBoxHeight = $("#sidebar .search-bar").outerHeight();
        var tabHeight = $("#sidebar #sidebar-tab").outerHeight();
        
        $('#sidebar-userlist .listview').height(height - headerHeight -  $("#sidebar-userlist .search-bar").outerHeight() - tabHeight);
        $('#sidebar-grouplist .listview').height(height - headerHeight -  $("#sidebar-grouplist .search-bar").outerHeight() - tabHeight);
        $('#sidebar-historylist .listview').height(height - headerHeight - tabHeight);
        
        $('#detailinfo-container').height(height - headerHeight);
        
        //login
        $('#view-login div.col-md-6').height(height);

        // chat view
        $("#main-container #messages").height(height - headerHeight - $("#text-message-box-container").outerHeight() - 30); // 50 is padding bottom

    }

}

module["exports"] = windowManager;
