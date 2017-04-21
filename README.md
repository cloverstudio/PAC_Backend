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

