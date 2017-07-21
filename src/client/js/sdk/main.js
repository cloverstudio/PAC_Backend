function isBrowser(){
    return typeof window !== 'undefined';
}

var fetch = {};

if(isBrowser()){

    if(!window.fetch)
        fetch = require('fetch-polyfill');
    else
        fetch = window.fetch;

}else{
    fetch = require('node-fetch');
}

var _spikaInit = (function(root) { // receives global object

    var SpikaSDK = {};
    oldSpikaSDK = root.SpikaSDK; 

    // properties
    SpikaSDK.apiKey = "";
    SpikaSDK.accessToken = "";
    SpikaSDK.baseURL = "";

    // methods
    SpikaSDK.init = function(baseURL,apiKey){
        this.baseURL = baseURL;
        this.apiKey = apiKey;
    }

    SpikaSDK.signin = function(organization,username,password,cb){
        
        var postData = {
            organization:organization,
            username:username,
            password:password
        };

        console.log(fetch);

        fetch(this.baseURL + '/user/signin', 
                {   method: 'POST', 
                    body: JSON.stringify(postData),
                    mode: 'cors',
                    headers:{
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        apikey:this.apiKey
                    }
                })
            .then(function(res) {
                
                if(res.status == 200){
                    return res.json();
                }else{
                    return res.text();
                }

            }).then(function(response) {
                
                cb(response);

            });
    }

    SpikaSDK.sendMessage = function(targetType,target,messageType,message,file,cb){

    }

    SpikaSDK.uploadFile = function(file){

    }

    SpikaSDK.downloadFile = function(fileID){
        
    }

    SpikaSDK.messageList = function(roomID,lastMessageID,direction){
        
    }


    if (isBrowser()) { 
        root.SpikaSDK = SpikaSDK;
    } else { 
        module.exports = SpikaSDK;
    }

    // Conflict
    SpikaSDK.noConflict = function() {
        root.SpikaSDK = oldSpikaSDK;
        return SpikaSDK;
    };

}); 

if(typeof window !== 'undefined'){
    _spikaInit(window);
}else{
    _spikaInit({});
}