FROM node:6.9.4-alpine
ADD package.json /app/package.json
WORKDIR /app
RUN npm install
ADD . /app
CMD node index.js
