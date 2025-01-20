FROM node:22-bullseye-slim AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --configuration=production


FROM nginx:latest

ARG NGINX_CONF
COPY ${NGINX_CONF} /etc/nginx/nginx.conf

COPY --from=build-stage /app/dist/whatsapp-clone-ui/browser /usr/share/nginx/html

EXPOSE 80