# SFB_Server

This repository contains following.

- Spika for Business Backend ( src/server )
- Spika for Business Web Client ( src/client )

## Requirements

- NodeJS : v5.0
- MongoDB :  v2.4.9
- Redis Server : v2.8.4

### Port Settings
- 25 ( TCP ): To send email from backend ( TCP ): For Web API
- 443 ( TCP ): If you use HTTPS
- 88 ( TCP ): For our git repository
- 3478 ( TCP and UDP): For turn server
- 49152 to 65535 ( TCP and UDP ) : For turn server

## How to deploy server 

Here is step by step explanation how to setup Backend in Ubuntu 16.04

- Install NodeJS
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

- Install Packages
```
sudo apt-get install -y git imagemagick build-essential libfuse-dev libcurl4-openssl-dev libxml2-dev mime-support automake libtool mongodb redis-server turnserver python
```

- Download Spika from github
```
git clone https://github.com/cloverstudio/SFB_Server.git
```

- Install npms
```
cd SFB_Server
npm install
```

- Start Servers
```
/etc/init.d/mongodb start
/etc/init.d/redis-server start
```

- Edit init.js
```
cp src/server/lib/init-sample.js src/server/lib/init.js
```
And edit init.js to fit to your environment

- Start Spika
```
node src/server/main
```

## Setup Forever

We recommend to setup forever so server automatically restarts if crashed

```
sudo npm install -g Forever
```

Start with forever
```
nohup forever src/server/main.js &
```

## init.js

Here is important params in init.js.
** To activate changes please restart nodejs process. **

- Config.host

Keep it localhost

- Config.port

In most case it will be 80 or 443

- Config.databaseUrl

Here comes uri string to connect to mongoDB

- Config.supportUserId

This user appears in all user as support. First create user and get the id of the user.

- Config.redis

Connect info to Redis server

- Config.AESPassword

Please be sure this to be same as iOS/Android/Web

- Config.uploadPath

Here comes files which users uploaded. Includeing avatars.

- Config.hashSalt

This is also need to be same as apps.

- Config.username
- Config.password

Credentials to login service owner console

- Config.apnsCertificates

Path for certificates for push notification.

- Config.fcmServerKey

It is for Android's push notification

- Config.protocol

Needs to be https if ssl is supported in nodejs level

- 