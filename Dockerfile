FROM node:12.19
ENV NODE_ENV=production

WORKDIR /MopDir
COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production --also=dev
COPY . .

EXPOSE 80

RUN mv Server/Config/MopConfSample.json Server/Config/MopConf.json 

RUN npm run build-ts

CMD [ "node", "./Build/index.js" ]