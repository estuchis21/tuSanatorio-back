# tuSanatorio-back/Dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Instalar nodemon globalmente para desarrollo
RUN npm install -g nodemon

COPY . .

EXPOSE 3000

# Usamos nodemon para que recargue automáticamente al cambiar archivos
CMD ["nodemon", "--legacy-watch", "server.js"]
