import mongoose from "mongoose";
import "dotenv/config";

import { User } from "./src/models/userModel.js";
import { Post } from "./src/models/postModel.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    //Garante professor
    let professor = await User.findOne({ email: "prof@email.com" });

    if (!professor) {
      professor = await User.create({
        nome: "Professor Admin",
        email: "prof@email.com",
        senha: "123456",
        role: "professor",
      });
      console.log("Professor criado");
    }

    let aluno = await User.findOne({ email: "aluno@email.com" });

    if (!aluno) {
      aluno = await User.create({
        nome: "Aluno",
        email: "aluno@email.com",
        senha: "123456",
        role: "aluno",
      });
      console.log("Aluno criado");
    }

    //Limpa posts antigos (opcional)
    await Post.deleteMany({ autor: professor._id });

    //Cria posts
    const posts = await Post.insertMany([
      {
        titulo: "Introdução ao Node.js",
        conteudo: "Conteúdo inicial sobre Node.js...",
        autor: professor._id,
      },
      {
        titulo: "MongoDB com Mongoose",
        conteudo: "Como modelar dados usando Mongoose...",
        autor: professor._id,
      },
      {
        titulo: "Autenticação com JWT",
        conteudo: "Implementando login seguro com JWT...",
        autor: professor._id,
      },
      {
        titulo: "Introdução ao Typescript",
        conteudo: "Conteúdo inicial sobre Typescript...",
        autor: professor._id,
      },
      {
        titulo: "Introdução ao Docker",
        conteudo: "Conteúdo inicial sobre Docker...",
        autor: professor._id,
      },
      
      {
        titulo: "Introdução ao Linux",
        conteudo: "Conteúdo inicial sobre Linux...",
        autor: professor._id,
      },
      
      {
        titulo: "Introdução ao Javascript",
        conteudo: "Conteúdo inicial sobre Javascript...",
        autor: professor._id,
      },
    ]);

    console.log(`${posts.length} posts criados com sucesso`);

    process.exit(0);
  } catch (error) {
    console.error("Erro na seed:", error);
    process.exit(1);
  }
}

run();
