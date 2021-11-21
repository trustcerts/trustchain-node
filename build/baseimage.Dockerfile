FROM node:17-alpine
ARG app

ARG NPM_TOKEN

## Install build toolchain, install node deps and compile native add-ons
RUN apk add py-pip make g++ openssl docker bash


## Install build toolchain, install node deps and compile native add-ons
# RUN apk add python make g++
## install libraries
COPY ./package*.json ./

RUN npm config set @trustcerts:registry https://gitlab.com/api/v4/packages/npm/
RUN npm config set '//gitlab.com/api/v4/packages/npm/:_authToken' "${NPM_TOKEN}"

RUN npm ci --only=production
RUN rm package*.json

COPY ./build/wait-for-it.sh ./
