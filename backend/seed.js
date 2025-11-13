import mongoose from "mongoose";
import { User } from "./src/models/userModel.js";

const run = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/blogfaseiv");
    await User.deleteMany({});

    const professor = await User.create({
      nome: "Professor Admin",
      email: "prof@email.com",
      senha: "123456",
      role: "professor",
    });

    console.log("Professor criado com sucesso:", professor);
    process.exit(0);
  } catch (error) {
    console.error("Erro ao criar professor:", error);
    process.exit(1);
  }
};

run();
