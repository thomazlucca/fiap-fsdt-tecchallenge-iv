export const isProfessor = (req, res, next) => {
  if (req.user.role !== "professor") {
    return res
      .status(403)
      .json({ error: "Acesso permitido apenas para professores." });
  }

  next();
};

//professor
//  prof@email.com
//  123456
//aluno: "email": "thomaz@email.com",
//senha: "senha123456"
