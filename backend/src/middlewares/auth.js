import jwt from "jsonwebtoken";

export const auth = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Token não enviado" });

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Token inválido" });
    }
  };
};
