FROM node:12.20.1-alpine3.12

WORKDIR /usr/src/Mop

RUN mkdir Authentication
RUN mkdir lib

COPY ./Authentication/package*.json ./Authentication/
RUN npm install --prefix ./Authentication

COPY ./Authentication/ ./Authentication/
COPY ./lib/ ./lib/

RUN cd ./Authentication/ && npx ttsc 

CMD [ "node", "Authentication/Build/Authentication/Frontend/index.js" ]