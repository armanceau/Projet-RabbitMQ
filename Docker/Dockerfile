FROM node:24-alpine3.20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "src/producers/producer.js", "add", "2", "5"]
