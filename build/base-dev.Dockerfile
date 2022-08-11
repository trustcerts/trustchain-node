FROM node:18.7.0-alpine3.16

WORKDIR /app

## Install build toolchain, install node deps and compile native add-ons
RUN apk add py-pip make g++ openssl docker bash

# RUN npm i -g @nestjs/cli
RUN npm i -g nodemon

COPY ./package*.json ./

RUN npm ci

RUN rm package*.json

COPY ./build/wait-for-it.sh ./

RUN chmod +x wait-for-it.sh

EXPOSE 3000