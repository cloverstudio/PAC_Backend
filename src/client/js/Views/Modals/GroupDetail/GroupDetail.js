var $ = require('jquery');
var _ = require('lodash');

var Const = require('../../../lib/consts.js');
var Utils = require('../../../lib/utils.js');

var template = require('./GroupDetail.hbs');
var templateListRows = require('./MemberListRow.hbs');

var GroupUserListClient = require('../../../lib/APIClients/GroupUserListClient');

var GroupDetail = {
    
    page : 1,
    group: null,
    reachedToEnd: false,
    initialRowCount : -1,
    show: function(groupObj) {

        var self = this;
        
        this.page = 1;
        this.reachedToEnd = false;
        this.initialRowCount = -1;
        
        if(!groupObj)
            return;
        
        this.group = groupObj;
        
        $('body').append(template({
            group: groupObj
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
            
        GroupUserListClient.send(this.group._id,this.page,function(response){
            
            $('#memberlist table').append(templateListRows({
                list: response.list
            }));
            
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
                message = Utils.l10n("Critical Error");
            
            var Alert = require('../AlertDialog/AlertDialog');
            Alert.show(Utils.l10n('API Error'),message);
             
        });
        
    }
    
}

module.exports = GroupDetail;