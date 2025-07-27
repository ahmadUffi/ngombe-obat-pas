from node:18

WORKDIR  /app

copy package*.json ./

RUN npm install

COPY . .

CMD ["node", "src/index.js"]

expose 5000