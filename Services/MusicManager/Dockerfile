FROM node:12.20.1-alpine3.12

WORKDIR /usr/src/Mop

RUN mkdir MusicManager
RUN mkdir lib

COPY ./MusicManager/package*.json ./MusicManager/
RUN npm install --prefix ./MusicManager

COPY ./MusicManager/ ./MusicManager/
COPY ./lib/ ./lib/

RUN cd ./MusicManager/ && npx ttsc 

CMD [ "node", "MusicManager/Build/MusicManager/Service/index.js" ]