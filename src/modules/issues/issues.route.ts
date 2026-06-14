import { Router, type Request, type Response } from "express";
import auth from "../../middleware/auth";
import { pool } from "../../db";
import config from "../../config";
import jwt from "jsonwebtoken";
import { type JwtPayload } from "jsonwebtoken";

export const router = Router();
type status = "open" | "in_progress" | "resolved";

router.post(
  "/",
  auth("contributor", "maintainer"),
  async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization;

      const decodedToken = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;
      const user = await pool.query(
        `
            SELECT * FROM users where id = $1`,
        [decodedToken.id],
      );
      const reporter_id = user.rows[0].id;
      const { title, description, type } = req.body;
      const issue = await pool.query(
        `
            INSERT INTO issues (title, description, type,status,reporter_id) VALUES($1,$2,COALESCE($3,'bug'),'open',$4) RETURNING id,title,description,type,status,reporter_id,created_at,updated_at`,
        [title, description, type, reporter_id],
      );
      return res.status(201).json({
        success: true,
        message: "Issue created successfully",
        data: issue.rows[0],
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

const issueRouter = router;
export default issueRouter;
