FROM node:latest

RUN mkdir -p /usr/src/ZachBot
WORKDIR /usr/src/ZachBot

COPY . /usr/src/ZachBot/
RUN npm install

CMD ["node","index.js"]