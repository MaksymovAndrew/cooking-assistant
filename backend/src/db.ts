import { Pool } from "pg";

import { config } from "config/env";
import { logger } from "config/logger";

const pool = new Pool({ ...config.db, ...config.dbPool });

// without a listener an idle client error would crash the whole process
pool.on("error", (err) => {
    logger.error(err, "idle pg client error");
});

export default pool;
