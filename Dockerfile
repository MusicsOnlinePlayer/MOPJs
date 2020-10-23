FROM node:12.19
ENV NODE_ENV=production

WORKDIR /MopDir
COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production --also=dev
COPY . .

EXPOSE 80

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip

RUN pip3 install git+https://github.com/MalauD/DeezloaderPython.git

RUN mv Server/Config/MopConfSample.json Server/Config/MopConf.json 

RUN npm run build --if-present

CMD [ "node", "index.js" ]