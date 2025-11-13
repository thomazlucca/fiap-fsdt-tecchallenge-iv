export const isProfessor = (req, res, next) => {
  if (req.user.role !== "professor") {
    return res
      .status(403)
      .json({ error: "Acesso permitido apenas para professores." });
  }

  next();
};
