var $ = require('jquery');
var _ = require('lodash');
var Utils = require('../../../lib/utils.js');
var template = require('./ConfirmDialog.hbs');

var ConfirmDialog = {

    show: function(title, text, onOK, onCancel) {
        var self = this;
        $('body').append(template({
            title: title,
            text: text
        }));
        $('#modal-confirm').on('hidden.bs.modal', function(e) {
            $('#modal-confirm').remove();
        })
        $('#modal-confirm').modal('show');
        
        $('#modal-btn-cancel').on('click', function() {
            
            self.hide();
            
            if(onCancel)
                onCancel();
            
        });

        $('#modal-btn-ok').on('click', function() {

            self.hide();

            if(onOK)
                onOK();
        });
        
    },
    
    hide: function(onFinish) {
        $('#modal-confirm').modal('hide');
    }
}

module.exports = ConfirmDialog;