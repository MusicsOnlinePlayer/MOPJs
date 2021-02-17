FROM node:12.20.1-alpine3.12

WORKDIR /usr/src/Mop

RUN mkdir UserManager
RUN mkdir lib

COPY ./UserManager/package*.json ./UserManager/
RUN npm install --prefix ./UserManager

COPY ./UserManager/ ./UserManager/
COPY ./lib/ ./lib/

RUN cd ./UserManager/ && npx ttsc 

CMD [ "node", "UserManager/Build/UserManager/Service/index.js" ]