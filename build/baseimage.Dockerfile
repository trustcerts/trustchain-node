FROM node:17-alpine
ARG app

## Install build toolchain, install node deps and compile native add-ons
RUN apk add py-pip make g++ openssl docker bash


## Install build toolchain, install node deps and compile native add-ons
# RUN apk add python make g++
## install libraries
COPY ./package*.json ./

RUN npm ci --only=production
RUN rm package*.json

COPY ./build/wait-for-it.sh ./
