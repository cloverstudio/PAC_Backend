// define global functions here
var Settings = require('./Settings');

// Spika Selector
window.SS = function(sel){
    var selector = Settings.options.defaultContainer + " " + sel;
    
    return $(selector);
}