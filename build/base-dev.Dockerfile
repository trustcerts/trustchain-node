FROM node:17-alpine

WORKDIR /app

ARG NPM_TOKEN

## Install build toolchain, install node deps and compile native add-ons
RUN apk add py-pip make g++ openssl docker bash

RUN npm config set @trustcerts:registry https://gitlab.com/api/v4/packages/npm/
RUN npm config set '//gitlab.com/api/v4/packages/npm/:_authToken' "${NPM_TOKEN}"

# RUN npm i -g @nestjs/cli
RUN npm i -g nodemon

COPY ./package*.json ./

RUN npm ci

RUN rm package*.json

COPY ./build/wait-for-it.sh ./

RUN chmod +x wait-for-it.sh

EXPOSE 3000