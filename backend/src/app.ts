import compression from "compression";
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
import { ERROR_CODES } from "constants/errorCodes";
import { API_PREFIX, HEALTH_PATH } from "constants/routes";
import { NotFoundError } from "domain/errors/AppError";

import errorHandler from "middleware/errorHandler";
import { createGlobalLimiter } from "middleware/rateLimit";
import createCalorieRouter from "routes/calorie.routes";
import createFavouriteRouter from "routes/favourite.routes";
import createHealthRouter from "routes/health.routes";
import createIngredientRouter from "routes/ingredient.routes";
import createMenuRouter from "routes/menu.routes";
import createMenuCategoryRouter from "routes/menuCategory.routes";
import createRecipeRouter from "routes/recipe.routes";
import createTypeRouter from "routes/type.routes";
import createUserRouter from "routes/user.routes";
import createUserIngredientsRouter from "routes/userIngredients.routes";

import type { Controllers } from "./composition-root";

// req.url is the raw request target: a prober's cache-buster query and a trailing slash are both
// served by the same route, so neither may slip past the filter
const isHealthProbe = (req: { url?: string }): boolean => {
    const [pathname = ""] = (req.url ?? "").split("?");

    return pathname.replace(/\/$/, "") === HEALTH_PATH;
};

export function createApp(controllers: Controllers): Express {
    const app = express();

    app.set("trust proxy", TRUST_PROXY_HOPS);
    app.use(helmet({ hsts: HSTS_OPTIONS }));
    app.use(compression());
    app.use(
        pinoHttp({
            logger,
            // keep auth tokens and cookies out of logs
            redact: ["req.headers.authorization", "req.headers.cookie"],
            // the liveness probe runs every 15s and says nothing; at 3 rotated files of 10 MB it
            // was crowding out the logs that do
            autoLogging: { ignore: isHealthProbe },
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

    app.use(API_PREFIX, createHealthRouter());
    app.use(createGlobalLimiter());
    app.use(API_PREFIX, createUserRouter(controllers.userController));
    app.use(
        API_PREFIX,
        createIngredientRouter(controllers.ingredientController),
    );
    app.use(API_PREFIX, createRecipeRouter(controllers.recipeController));
    app.use(API_PREFIX, createTypeRouter(controllers.recipeTypeController));
    app.use(
        API_PREFIX,
        createUserIngredientsRouter(controllers.userIngredientsController),
    );
    app.use(API_PREFIX, createMenuRouter(controllers.menuController));
    app.use(
        API_PREFIX,
        createMenuCategoryRouter(controllers.menuCategoryController),
    );
    app.use(API_PREFIX, createCalorieRouter(controllers.calorieController));
    app.use(API_PREFIX, createFavouriteRouter(controllers.favouriteController));

    app.use((_req, _res, next) => {
        next(new NotFoundError(ERROR_CODES.NOT_FOUND));
    });
    app.use(errorHandler);

    return app;
}
