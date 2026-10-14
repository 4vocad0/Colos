# infra/docker/web/Dockerfile
FROM node:24

WORKDIR /Kolos

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]