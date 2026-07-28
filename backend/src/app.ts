import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { config } from "config/env";
import { logger } from "config/logger";
import {
    CORS_METHODS,
    HSTS_OPTIONS,
    JSON_BODY_LIMIT,
    TRUST_PROXY_HOPS,
} from "config/security";
import { ERROR_MESSAGES } from "constants/errorMessages";

import errorHandler from "middleware/errorHandler";
import { createGlobalLimiter } from "middleware/rateLimit";
import createHealthRouter from "routes/health.routes";
import createIngredientRouter from "routes/ingredient.routes";
import createMenuRouter from "routes/menu.routes";
import createMenuCategoryRouter from "routes/menuCategory.routes";
import createRecipeRouter from "routes/recipe.routes";
import createTypeRouter from "routes/type.routes";
import createUserRouter from "routes/user.routes";
import createUserIngredientsRouter from "routes/userIngredients.routes";

import type { Controllers } from "./composition-root";

export function createApp(controllers: Controllers): Express {
    const app = express();

    app.set("trust proxy", TRUST_PROXY_HOPS);
    app.use(helmet({ hsts: HSTS_OPTIONS }));
    app.use(
        pinoHttp({
            logger,
            // keep auth tokens and cookies out of logs
            redact: ["req.headers.authorization", "req.headers.cookie"],
        }),
    );
    app.use(
        cors({
            origin: config.corsOrigin,
            methods: CORS_METHODS,
            credentials: true,
        }),
    );
    app.use(express.json({ limit: JSON_BODY_LIMIT }));
    app.use(cookieParser());

    app.use("/api", createHealthRouter());
    app.use(createGlobalLimiter());
    app.use("/api", createUserRouter(controllers.userController));
    app.use("/api", createIngredientRouter(controllers.ingredientController));
    app.use("/api", createRecipeRouter(controllers.recipeController));
    app.use("/api", createTypeRouter(controllers.recipeTypeController));
    app.use(
        "/api",
        createUserIngredientsRouter(controllers.userIngredientsController),
    );
    app.use("/api", createMenuRouter(controllers.menuController));
    app.use(
        "/api",
        createMenuCategoryRouter(controllers.menuCategoryController),
    );

    app.use((_req, res) => {
        res.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
    });
    app.use(errorHandler);

    return app;
}
