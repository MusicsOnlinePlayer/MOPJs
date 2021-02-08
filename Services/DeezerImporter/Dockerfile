FROM node:12.20.1-alpine3.12

WORKDIR /usr/src/Mop

RUN mkdir DeezerImporter
RUN mkdir lib

COPY ./DeezerImporter/package*.json ./DeezerImporter/
RUN npm install --prefix ./DeezerImporter

COPY ./DeezerImporter/ ./DeezerImporter/
COPY ./lib/ ./lib/

RUN cd ./DeezerImporter/ && npx ttsc 

CMD [ "node", "DeezerImporter/Build/DeezerImporter/Service/index.js" ]