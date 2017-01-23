(function(global) {

    "use strict;"

    var Config = {};

    Config.apiBaseUrl = "http://localhost:8080/spika/v1";
    Config.socketUrl = "/spika";
    Config.googleMapAPIKey = "AIzaSyDOkqeO0MZ_igwH_zGyy95DO1ahM8-Ebrw";
    Config.defaultContainer = "#spika-container";
    Config.lang = "en";
    Config.showSidebar = false;
    Config.showTitlebar = false;
    Config.useBothSide = false;
    Config.thumbnailHeight = 256;
    Config.autoStart = false;
    
    // Exports ----------------------------------------------
    module["exports"] = Config;

})((this || 0).self || global);
