FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

EXPOSE 4000 4001

CMD ["node", "dist/index.js"]
