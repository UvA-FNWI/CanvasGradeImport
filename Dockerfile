FROM node:20-alpine AS build
WORKDIR /source

COPY package-lock.json .
COPY package.json .

RUN npm i --no-audit

COPY . .

RUN npm run build

FROM nginx:1.27.3-alpine

RUN apk add bash

COPY --from=build /source/dist /usr/share/nginx/html