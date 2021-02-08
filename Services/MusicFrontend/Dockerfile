FROM node:12.20.1-alpine3.12

WORKDIR /usr/src/Mop

RUN mkdir MusicFrontend
RUN mkdir lib

COPY ./MusicFrontend/package*.json ./MusicFrontend/
RUN npm install --prefix ./MusicFrontend

COPY ./MusicFrontend/ ./MusicFrontend/
COPY ./lib/ ./lib/

RUN cd ./MusicFrontend/ && npx ttsc 

CMD [ "node", "MusicFrontend/Build/MusicFrontend/Frontend/index.js" ]