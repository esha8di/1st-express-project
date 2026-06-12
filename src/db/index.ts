import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connectionString,
});

export const initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS USERS (
            ID SERIAL PRIMARY KEY,
            NAME VARCHAR(255) NOT NULL,
            EMAIL VARCHAR(255) NOT NULL UNIQUE,
            ROLE VARCHAR(20) NOT NULL DEFAULT 'CONTRIBUTOR',
             PASSWORD VARCHAR(255),
            CREATED_AT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP )`);

    await pool.query(`
                CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL
        CHECK (LENGTH(description) >= 20),
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('bug', 'feature_request')),
    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'resolved')),
    reporter_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`);
    console.log("database create successfully!");
  } catch (err) {
    console.log(err);
  }
};
