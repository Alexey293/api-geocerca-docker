FROM node:20

WORKDIR /usr/src/app

# Habilitar Corepack para usar Yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# Copiar archivos de configuración
COPY package.json .yarnrc.yml ./

# Instalar dependencias con Yarn
RUN yarn install

# Copiar el resto del proyecto (server.js, index.html, etc.)
COPY . .

# Puerto expuesto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["yarn", "start"]