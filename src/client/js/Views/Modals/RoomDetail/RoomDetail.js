var $ = require('jquery');
var _ = require('lodash');

var Const = require('../../../lib/consts.js');
var Utils = require('../../../lib/utils.js');

var template = require('./RoomDetail.hbs');
var templateListRows = require('./MemberListRow.hbs');

var RoomUserListClient = require('../../../lib/APIClients/RoomUserListClient');


var ChatManager = require('../../../lib/ChatManager');
var loginUserManager = require('../../../lib/loginUserManager');

var RoomDetail = {
    
    page : 1,
    room: null,
    reachedToEnd: false,
    initialRowCount : -1,
    show: function(roomObj) {

        var self = this;
        
        this.page = 1;
        this.reachedToEnd = false;
        this.initialRowCount = -1;
        
        if(!roomObj)
            return;
        
        this.room = roomObj;
        
        $('body').append(template({
            room: roomObj
        }));
        
        $('#modal1').on('hidden.bs.modal', function(e) {
            $('#modal1').remove();
        })
        
        $('#modal1').modal('show');
        
        $('#modal-btn-close').on('click', function() {
            self.hide();
        });

        $("#memberlist").on('scroll',function() {
            
            // check is bottom
            if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                
                self.loadNext();
                
            }
            
        });
        
        this.loadNext();
    },
    
    hide: function(onFinish) {
        $('#modal1').on('hidden.bs.modal', function(e) {
            $('#modal1').remove();
        })
        $('#modal1').modal('hide');
    },
    
    loadNext : function(){
        
        var self = this;
        
        if(this.reachedToEnd)
            return;
            
        RoomUserListClient.send(this.room._id,this.page,function(response){
            
            $('#memberlist table').append(templateListRows({
                list: response.list
            }));

            $('#memberlist table tr').unbind().click(function(){

                var userId = $(this).attr('userid');

                if(userId != loginUserManager.getUser()._id){
                    ChatManager.openChatByUserId(userId);
                    self.hide();
                }
                
            });
            

            if(self.initialRowCount == -1)
                self.initialRowCount = response.list.length;
            
            self.page++;
            
            if(self.initialRowCount < response.list.length)
                self.reachedToEnd = true;
            
        },function(errCode){

            var message = "";
            
            if(Const.ErrorCodes[errCode])
                message = Utils.l10n(Const.ErrorCodes[errCode]);
            else
                message = Utils.l10n("No internet connection, please try again later.");
            
            var Alert = require('../AlertDialog/AlertDialog');
            Alert.show(Utils.l10n('API Error'),message);
             
        });
        
    }
    
}

module.exports = RoomDetail;