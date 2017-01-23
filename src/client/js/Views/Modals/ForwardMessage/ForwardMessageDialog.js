var $ = require('jquery');
var _ = require('lodash');

var Utils = require('../../../lib/utils.js');
var UIUtils = require('../../../lib/UIUtils');
var Const = require('../../../lib/consts.js');

var template = require('./ForwardMessageDialog.hbs');
var templateRow = require('./SearchListContents.hbs');

var loginUserManager = require('../../../lib/loginUserManager');

var AllSearchClient = require('../../../lib/APIClients/AllSearchClient');
var ForwardMessageClient = require('../../../lib/APIClients/ForwardMessageClient');

var ForwardMessageDialog = {
    
    currentPage : 1,
    currentKeyword: "",
    isLoading: false,
    lastSearchedKeyword: "",
    listData : [],
    messageId: null,
    selectedId : null,
    $: function(selector){
        return $("#modal-forward " + selector)
    },
    show: function(messageId) {

        var self = this;
        
        this.messageId = messageId;
        
        $('body').append(template({
        }));
        
        this.$('').on('hidden.bs.modal', function(e) {
            self.$('').remove();
        })
        
        this.$('').modal('show');
        
        this.$('#modal-btn-close').on('click', function() {
            self.hide();
        });
        
        this.resetResultAndLoadNext("");

        this.$(".listview").on('scroll',function() {
            
            // check is bottom
            if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                
                self.loadNext(self.currentKeyword);
                
            }
            
        });

       this.$("input").on('keyup',function() {

            var keyword = $(this).val();
            self.resetResultAndLoadNext(keyword);
            
        });
        
        this.$('#modal-btn-send').on('click',function(){
            
            // generate chatId
            var selectedObj = _.find(self.listData,function(row){
                
                return row._id == self.selectedId;
                    
            });
            
            var chatId = "";
            
            if(selectedObj.type == Const.chatTypePrivate){
                chatId = Utils.chatIdByUser(selectedObj,loginUserManager.getUser());
                
            }else if(selectedObj.type == Const.chatTypeGroup){
                chatId = Utils.chatIdByGroup(selectedObj);
                
            }else if(selectedObj.type == Const.chatTypeRoom){
                chatId = Utils.chatIdByRoom(selectedObj);
                
            }
            
            self.$('#modal-btn-send').attr('disabled','disabled');
            
            ForwardMessageClient.send(self.messageId,chatId,function(){
                
                self.hide();
                
            },function(errorCode){
            
                UIUtils.handleAPIErrors(errorCode);
                self.isLoading = false;
                self.lastSearchedKeyword = "";
                
            });
             
        });

    },
    
    hide: function() {
        
        var self = this;
        
        this.$('').on('hidden.bs.modal', function(e) {
            self.$('').remove();
        });
        
        this.$('').modal('hide');
    },
    
    resetResultAndLoadNext: function(keyword){
        
        var self = this;
        
        if(this.isLoading){
            this.lastSearchedKeyword = keyword;
            return;
        }
        
        this.currentPage = 1;
        this.listData = [];
        this.currentKeyword = keyword;
        this.$(".listview").html("");
        
        this.loadNext(keyword);
        
        
    },
    loadNext: function(keyword){
        
        var self = this;
        this.isLoading = true;
        
        AllSearchClient.send(keyword,this.currentPage,function(result){
            
            var html = templateRow({
                list: result.list
            });
            
            self.listData = self.listData.concat(result.list);
            self.currentPage++;
            
            self.$(".listview").append(html);
            
            self.$('.search-list-row').unbind().on('click',function(){
                
                var id = $(this).attr('id');
                
                self.selectedId = id;
                self.$('.selected').removeClass('selected');
                $(this).addClass('selected');
                self.$('#modal-btn-send').removeAttr('disabled');
                
            });
            
            if(!_.isEmpty(self.lastSearchedKeyword)){
                
                self.resetResultAndLoadNext(this.lastSearchedKeyword)
                    
            }
            
            self.lastSearchedKeyword = "";
            self.isLoading = false;
            
        },function(errorCode){
            
            UIUtils.handleAPIErrors(errorCode);
            self.isLoading = false;
            self.lastSearchedKeyword = "";
            
        });
        
    }
}
module.exports = ForwardMessageDialog;