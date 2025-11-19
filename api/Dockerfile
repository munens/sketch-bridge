FROM node:16.14.2-slim

RUN apt-get update -y && apt-get upgrade -y

RUN npm install -g npm@9.3.1

RUN mkdir -p ~/src/app

COPY package.json /root/src/app/package.json

RUN cd ~/src/app && npm install

RUN npm install knex -g && npm install typescript -g

WORKDIR /root/src/app

COPY . .

RUN rm -rf coverage dist

EXPOSE 8090

CMD npm run start