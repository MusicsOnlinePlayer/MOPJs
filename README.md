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
 - Like musics, create playlists (wip) and access them using your own account

## Feedbacks

Feel free to send us feedback on [github as an issue](https://github.com/MusicsOnlinePlayer/MOPJs/issues/new). Feature requests are always welcome. If you wish to contribute, please take a quick look at the [guidelines](./CONTRIBUTING.md)!

If there's anything you'd like to chat about, please feel free to write an e-mail at <malaury.dutour@gmail.com>
## Contributing
I'm glad you want to support my project. Before you commit a pull request, just make sure you are using guidelines specified on the linter, see [eslint config file](https://github.com/MusicsOnlinePlayer/MOPJs/blob/master/.eslintrc.json) 

## Requirements
Before installing MOPJs, it is needed to have the following software (which are completely free & open source)
 * Elasticsearch *(v7 at least)* - [Dowload link](https://www.elastic.co/downloads/elasticsearch)
 * MongoDB *(v4 at least)* - [Dowload link](https://www.mongodb.com/try/download/community)
 * Python with pip *(version 3 required)* - [Dowload link](https://www.python.org/downloads/)
 * Nodejs *(8 at least for general use but 10 at least for testing and dev)* - [Dowload link](https://nodejs.org/en/download/)
 * A deezer arl token *(not mendatory)*
 * Fluentd *(optional)* - [Dowload link](https://docs.fluentd.org/installation)

Installs of each softwares are pretty much straightforward but if you run into an issue, feel free to open an issue on this repo.

## Installation
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
If you want to connect to your deezer account you will need to install deezloader python package using pip. *(you can skip this step if you only want to access your personal music library)*
``` bash
python -m pip install git+https://github.com/MalauD/DeezloaderPython.git
```
Before starting the node app, you need to edit the config file located here `./Server/Config/MopConf.json`
Here is an example for a classical install with elasticsearch and mongodb and everything on the same computer.
``` json
{
    "DeezerArlToken" : "mytoken",
    "EsHost" : "http://localhost:9200",
    "MongoUrl" : "mongodb://localhost:27017/MOP",
    "EnableMongoAuth": false,
    "MinLogLevel": 0,
    "MopPort": 80,
    "UseFluentdLogging": false
}
```
Finally you can run the app (by the way, it is recommended to use pm2 for production use)
``` bash
npm run-script BuildClientProd
node index.js
```
And congratulation your mop instance is running ! 
The web app is accesible at `localhost`, the port is specified in the config file.

## Acknowledgments
Thanks @An0nimia for providing the python deezer API, see [here](https://github.com/An0nimia/deezloader).
