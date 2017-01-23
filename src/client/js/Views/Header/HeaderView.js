var Backbone = require('backbone');
var _ = require('lodash');

var Utils = require('../../lib/utils');
var Const = require('../../lib/consts');
var Config = require('../../lib/init');

var template = require('./Header.hbs');
var loginUserManager = require('../../lib/loginUserManager');

var SideMenu = require('../SideMenu/SideMenu');

var HeaderView = Backbone.View.extend({
    
    container : "",
    initialize: function(options) {
        this.container = options.container;
        this.render();
    },

    render: function() {
        
        $(this.container).html(template({
            Config:Config
        }));
        
        this.onLoad();
        
        return this;

    },

    onLoad: function(){
        
        if(this.customHeaderViewContent){
            $('#title-container').hide();
            
            $('#custom-header-container').show();
            $('#custom-header-container').html(this.customHeaderViewContent);
            
        }else{
             
        }

        Backbone.on(Const.NotificationCustomHeader, function(obj){
            
            $('#custom-header-container').show();
            $('#title-container').hide();
            
            $('#custom-header-container').html(obj.html);
        });
        
        Backbone.on(Const.NotificationUpdateHeader, function(obj){
            
            $('#custom-header-container').hide();
            $('#title-container').show();
            
            obj.title = Utils.strip(obj.title,30);
            
            if(loginUserManager.getUser().isGuest){
                
                var title = obj.title;
                
                

                if(obj.online){
                    title += " (" + Utils.l10n('online') + ")";
                }else{
                    title += " (" + Utils.l10n('offline') + ")";
                }
                
                $('#header-title-title').text(title);
                $('#header-title-description').text(obj.description);
                
            }else{
                $('#header-title-title').text(obj.title);
                $('#header-title-description').text(obj.description);
            }

            
            $('#header-title-image').attr("src",obj.img);
            $('#header-title .img-holder').css('display','inline');
            
            if(obj.online && obj.online == 1){
                $('#header-online-icon').css('display','inline');
            }else
                $('#header-online-icon').css('display','none');
        });
        
        $("#btn-menu-toggle").click(function(e) {
            
            SideMenu.tuggle();
            
        });
        
        
        Backbone.trigger(Const.NotificationUpdateWindowSize);
    }
    
});

module.exports = HeaderView;
