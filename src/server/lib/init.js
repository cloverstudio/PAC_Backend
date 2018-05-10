/** Sample configuration file */

var path = require('path');

var Config = {};

Config.host = "localhost";
Config.port = 8080;
Config.urlPrefix = '/';

Config.dbCollectionPrefix = '';
Config.databaseUrl = "mongodb://localhost/spikaenterprise";

Config.supportUserId = "56ec126ca4718ef424641692";
Config.forceLogoutAllDevice = true;

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

    push: {
        token: {
            key: path.resolve(
                __dirname,
                "../../..",
                "src/server/assets/certificates/AuthKey_ZC6SCFDB23.p8"
            ),
            keyId: "ZC6SCFDB23",
            teamId: "YU755VYJCP"
        },
        appbundleid: "com.clover-studio.spika-business"
    },
    voip: {
        key: path.resolve(
            __dirname,
            "../../..",
            "src/server/assets/certificates/voipkey.pem"
        ),
        cert: path.resolve(
            __dirname,
            "../../..",
            "src/server/assets/certificates/voipcert.pem"
        )
    }

};

Config.gcmAPIKey = "AIzaSyDmEGVEQfCImq5l4OhwK1Lt0upp5X_bzdg";
Config.fcmServerKey = "AAAA3zRqD2U:APA91bGKF4qepNZH6m81igpQRKJ19sDgpi7Fwjh2dpIhZ0GU7JkkUMUyT2hIIHuk5KP8mH8tMiNtyvfddJRyZvljJlaRmVujz8dcp3eBE8zQyXxXjOiDP6Q6Jg3xakfLPn-XuCfqUcuO";

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
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 465,
    username: 'AKIAIOHG7DLXFT2QQOMA',
    password: 'Als7Afp/q39PVPwwsoVkoXHrhDbEevKCgFYevtiurr+u'
}

Config.protocol = "https://";

Config.twilio = {
    accountSid: "ACb7b424531997b639ee96bf8d25be4245",
    authToken: "6d1b1231d5e9cc7bfb35a20cde3c9f22",
    fromNumber: "+16502296048"
};

Config.useVoipPush = true;

Config.useCluster = false;

Config.robotUserId = "56e0084a62a63ebf55eef398";

Config.phoneNumberSignin = false;

Config.defaultOrganizationId = "";

Config.vapidDetails = {
    email: 'info@clover.studio',
    publicKey: "BOnJ2nXysdTkDf8oxQuq2Uxcmv7MJo9GaRMH5zS7v9_3hltfHep1B1IS98jWkWYoQtT4PeEVaUCWB0HHIq94s_o",
    privateKey: "B_vvNWCpZ81972WH8UnRrjYtcX8k_aMm3eRag4MIi_k"
}

module["exports"] = Config;