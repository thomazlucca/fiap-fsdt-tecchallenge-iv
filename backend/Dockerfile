# Imagem base
FROM node:22

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Define a porta
EXPOSE 3000

# Comando para iniciar o app
CMD ["npm", "run", "dev"]