# MOP Js edition ![Node.js CI](https://github.com/MusicsOnlinePlayer/MOPJs/workflows/Node.js%20CI/badge.svg)

A music player server & client for the web capable of connecting to the Deezer Api for a better listenning experience.

**Available for mobile devices and the web.** 
See [MOPNative](https://github.com/MusicsOnlinePlayer/MOPNative) for the mobile client of MOPJs.

## Table of Contents
 - [Features](#Features)
 - [Feedbacks](#Feedbacks)
 - [Requirements](#Requirements)
 - [Installation](#Installation)
 - [Acknowledgments](#Acknowledgments)

## Features
A few of the things you can accomplish with MOPJs.
 - Access all your music library from the web or your mobile
 - Have an unified music library containing your personal and deezer musics.
 - Like musics, create playlists and access them using your own account
 - Import public deezer playlists

## Feedbacks

Feel free to send us feedback on [github as an issue](https://github.com/MusicsOnlinePlayer/MOPJs/issues/new). Feature requests are always welcome. If you wish to contribute, please take a quick look at the [guidelines](./CONTRIBUTING.md)!

If there's anything you'd like to chat about, please feel free to write an e-mail at <malaury.dutour@gmail.com>
## Contributing
I'm glad you want to support my project. Before you commit a pull request, just make sure you are using guidelines specified on the linter, see [eslint config file](https://github.com/MusicsOnlinePlayer/MOPJs/blob/master/.eslintrc.json) 

## Requirements
Before installing MOPJs, it is needed to have the following software (which are completely free & open source)
 * Elasticsearch *(v7 at least, optional)* - [Download link](https://www.elastic.co/downloads/elasticsearch)
 * MongoDB *(v4 at least)* - [Download link](https://www.mongodb.com/try/download/community)
 * Nodejs *(8 at least for general use but 10 at least for testing and dev)* - [Download link](https://nodejs.org/en/download/)
 * A deezer arl token *(not mendatory)*
 * Fluentd *(optional)* - [Download link](https://docs.fluentd.org/installation)

Installs of each softwares are pretty much straightforward but if you run into an issue, feel free to open an issue on this repo.

## Installation
### Using docker (Linux, Mac, Windows 10) - Without elasticsearch
First make sure you have Docker installed as well as docker compose.
Then clone the repo on your computer.
``` bash
git clone https://github.com/MusicsOnlinePlayer/MOPJs.git
cd MOPJs
```
Before running the app you need to add an `.env` file at the root of the project with your deezer token.
``` env
MOP_DEEZER_ARL=<YOUR DEEZER ARL TOKEN>
```

Then to start the app you need to type the following

```bash
docker-compose up
```

Mop is available on `localhost`

### Using npm

Thanks to the npm packager the installation process is fairly easy.
Start by cloning the repo on your computer.
``` bash
git clone https://github.com/MusicsOnlinePlayer/MOPJs.git
cd MOPJs
```
So now that you have downloaded the project, you can install all node modules by doing this
``` bash
npm install
```
Before starting the node app, you need to edit the config file located here `./Server/Config/MopConf.json`
Here is an example for a classical install with elasticsearch and mongodb and everything on the same computer.
``` json
{
    "EsHost" : "http://localhost:9200",
    "MongoUrl" : "mongodb://localhost:27017/MOP",
    "EnableMongoAuth": false,
    "MinLogLevel": 0,
    "MopPort": 80,
    "UseFluentdLogging": false,
    "DisableDeezerClient": false,
    "UseMongoSearchIndex": false
}
```
Also, you need to set Deezer Arl Token (optional) to be able to download deezer musics. To do that, you need to add a file called `.env` at the root of the project.

``` env
MOP_DEEZER_ARL=<YOUR DEEZER ARL TOKEN>
```

Finally you can run the app (by the way, it is recommended to use pm2 for production use)
``` bash
npm run-script BuildClientProd
node index.js
```
And congratulation your mop instance is running ! 
The web app is accessible at `localhost`, the port is specified in the config file.
