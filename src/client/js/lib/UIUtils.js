var Config = require('./init');
var sha1 = require('sha1');

var Const = require('./consts');
var Config = require('./init');
var Utils = require('./utils');

var UIUtils = {
    
    handleAPIErrors: function(errorCode){

        var alertDialog = require('../Views/Modals/AlertDialog/AlertDialog');

        var message = "";
        
        if(Const.ErrorCodes[errorCode])
            message = Utils.l10n(Const.ErrorCodes[errorCode]);
        else
            message = Utils.l10n("Critical Error");
            
        alertDialog.show(Utils.l10n("Api Error"),message);
            
    }
        
};

// Exports ----------------------------------------------
module["exports"] = UIUtils;

