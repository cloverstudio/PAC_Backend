var $ = require('jquery');
var _ = require('lodash');
var Utils = require('../../../lib/utils.js');
var template = require('./AlertDialog.hbs');

var AlertDialog = {

    show: function(title, text) {

        var self = this;
        $('body').append(template({
            title: title,
            text: text
        }));
        $('#modal1').on('hidden.bs.modal', function(e) {
            $('#modal1').remove();
        })
        $('#modal1').modal('show');
        
        $('#modal-btn-close').on('click', function() {
            self.hide();
        });
    },
    
    hide: function(onFinish) {
        $('#modal1').on('hidden.bs.modal', function(e) {
            $('#modal1').remove();
            if (!_.isUndefined(onFinish)) {
                onFinish();
            }
        })
        $('#modal1').modal('hide');
    }
}
module.exports = AlertDialog;