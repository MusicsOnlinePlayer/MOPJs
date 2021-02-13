FROM node:12.20.1-alpine3.12

WORKDIR /usr/src/Mop

RUN mkdir MusicSearch
RUN mkdir lib

COPY ./MusicSearch/package*.json ./MusicSearch/
RUN npm install --prefix ./MusicSearch

COPY ./MusicSearch/ ./MusicSearch/
COPY ./lib/ ./lib/

RUN cd ./MusicSearch/ && npx ttsc 

CMD [ "node", "MusicSearch/Build/MusicSearch/Service/index.js" ]