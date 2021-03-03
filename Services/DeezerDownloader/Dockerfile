FROM node:12.20.1-alpine3.12

WORKDIR /usr/src/Mop

RUN mkdir DeezerDownloader
RUN mkdir lib

COPY ./DeezerDownloader/package*.json ./DeezerDownloader/
RUN npm install --prefix ./DeezerDownloader

COPY ./DeezerDownloader/ ./DeezerDownloader/
COPY ./lib/ ./lib/

RUN cd ./DeezerDownloader/ && npx ttsc 

CMD [ "node", "DeezerDownloader/Build/DeezerDownloader/Service/index.js" ]