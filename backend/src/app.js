import express from "express";
import { swaggerUiMiddleware, swaggerUiSetup } from "./config/swagger.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json());

app.use("/docs", swaggerUiMiddleware, swaggerUiSetup);

app.use("/posts", postRoutes);
app.use("/users", userRoutes);

export default app;
