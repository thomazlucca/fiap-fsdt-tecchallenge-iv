import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    conteudo: { type: String, required: true },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
