# 🧠 FIAP - Tech Challenge IV (Backend)

---

## 🚀 Tecnologias Utilizadas

- **Node.js 22**
- **Express.js**
- **MongoDB** (via container Docker)
- **Mongoose**
- **JWT (JSON Web Token)** para autenticação
- **Swagger (swagger-jsdoc + swagger-ui-express)** para documentação da API
- **Docker / Docker Compose**

---

⚙️ Como Executar o Projeto

1️⃣ Pré-requisitos

Docker

Docker Compose

2️⃣ Clonar o repositório

```
git clone https://github.com/thomazlucca/fiap-fsdt-tecchallenge-iv.git
cd fiap-fsdt-tecchallenge-iv
```
3️⃣ Subir os containers
```
cd backend
docker compose up --build
```
4️⃣ Com os containers rodando, executar o seed para criar o primeiro usuário professor.
```
node seed.js
```

5. Acessar a aplicação
```
API:
http://localhost:3000
Documentação Swagger:
http://localhost:3000/api-docs
```
🧠 Endpoints Principais

POST	/auth/login  -Autenticação e geração de token

POST	/auth/register -Criação de usuário

GET	/posts  -Lista todos os posts

POST	/posts  -Cria um novo post

GET	/posts/:id  -Detalha um post específico

🔹 Todos os endpoints protegidos exigem o envio de um token JWT no header Authorization.
