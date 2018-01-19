/** Sample configuration file */

var path = require('path');

var Config = {};

Config.host = "localhost";
Config.port = 8080;
Config.urlPrefix = '/';

Config.dbCollectionPrefix = '';
Config.databaseUrl = "mongodb://localhost/spikaenterprise";

Config.supportUserId = "56ec126ca4718ef424641692";
Config.forceLogoutAllDevice = false;

Config.redis = {
    host: "localhost",
    port: 6379
}

Config.AESPassword = "cl0v3r-S+uD10-h4X0r1";

Config.publicPath = path.resolve(__dirname, "../../..", "public");
Config.uploadPath = path.resolve(__dirname, "../../..", "public/uploads/");

Config.socketNameSpace = '/spikaenterprise';
Config.defaultAvatar = "/img/noname.png";
Config.defaultAvatarGroup = "/img/noname-group.png";

Config.hashSalt = "8zgqvU6LaziThJI1uz3PevYd";

Config.username = "admin";
Config.password = "1234";

Config.signinBackDoorSecret = "";

Config.apnsCertificates = {

    dev: {
        key: null,
        cert: null
    },
    adhoc: {
        key: null,
        cert: null
    },
    store: {
        key: null,
        cert: null
    }

};

Config.gcmAPIKey = "";
Config.fcmServerKey = "";

Config.webRTCConfig = {
    "isDev": true,
    "socketNameSpace": "signaling",
    "server": {
        "port": Config.port,
        "secure": false,
        "key": null,
        "cert": null,
        "password": null
    },
    "peerConnectionConfig": {
        "iceTransports": "relay"
    },
    "rooms": {
        "maxClients": 0
    },

    /*
    "stunservers": [
    {
        "url": "stun:turnstun.spika.chat:3478"
    }
    ],
    "turnservers": [
        {
            "urls": ["turn:turnstun.spika.chat"],
            "secret": "turnserversharedsecret",
            "expiry": 86400,
            "user": 'spikaturn',
            "password": 'dka98n'
        }
    ]
    */

    "stunservers": [
        {
            "url": "stun:numb.viagenie.ca:3478"
        }
    ],
    "turnservers": [
        {
            "urls": ["turn:numb.viagenie.ca"],
            "secret": "turnserversharedsecret",
            "expiry": 86400,
            "user": 'ken.yasue@clover-studio.com',
            "password": 'yumiko'
        }
    ]

}

Config.email = {
    service: "",
    username: "",
    password: "",
    from: "no-reply@clover-studio.com"
};

Config.smtp = {
    host: '',
    port: 25,
    username: '',
    password: ''
}

Config.protocol = "http://";

Config.twilio = {
    accountSid: "",
    authToken: "",
    fromNumber: ""
};

Config.useVoipPush = true;

Config.useCluster = false;

Config.robotUserId = "56e0084a62a63ebf55eef398";

Config.phoneNumberSignin = false;

Config.defaultOrganizationId = "";

module["exports"] = Config;