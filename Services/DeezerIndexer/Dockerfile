FROM node:12.20.1-alpine3.12

WORKDIR /usr/src/Mop

RUN mkdir DeezerIndexer
RUN mkdir lib

COPY ./DeezerIndexer/package*.json ./DeezerIndexer/
RUN npm install --prefix ./DeezerIndexer

COPY ./DeezerIndexer/ ./DeezerIndexer/
COPY ./lib/ ./lib/

RUN cd ./DeezerIndexer/ && npx ttsc 

CMD [ "node", "DeezerIndexer/Build/DeezerIndexer/Service/index.js" ]