import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  while (true) {
    try {
      await mongoose.connect(uri);
      console.log("MongoDB conectado");
      break;
    } catch (err) {
      console.error("Erro ao conectar no Mongo, tentando novamente...");
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}
