import { pool } from "../../db";
import type { IIssue, IIssueUpdate } from "./issues.interface";

const createIssue = async (
  payload: IIssue,
  reporter_id: number,
) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `INSERT INTO issues (title, description, type, status, reporter_id) VALUES($1,$2,COALESCE($3,'bug'),'open',$4) RETURNING id,title,description,type,status,reporter_id,created_at,updated_at`,
    [title, description, type, reporter_id],
  );
  return result;
};

const getIssues = async (query: {
  sort?: string | undefined;
  type?: string | undefined;
  status?: string | undefined;
}) => {
  const { sort = "newest", type, status } = query;

  let sql = `SELECT * FROM issues WHERE 1=1`;
  const values: string[] = [];
  let count = 1;

  if (type) {
    sql += ` AND type = $${count}`;
    values.push(type);
    count++;
  }

  if (status) {
    sql += ` AND status = $${count}`;
    values.push(status);
    count++;
  }

  sql += sort === "oldest" ? ` ORDER BY created_at ASC` : ` ORDER BY created_at DESC`;

  const result = await pool.query(sql, values);
  return result;
};

const getIssuebyIdfromDB = async (id: any) => {
  const result = await pool.query(
    `SELECT
      i.id,
      i.title,
      i.description,
      i.type,
      i.status,
      i.created_at,
      i.updated_at,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'role', u.role
      ) AS reporter
     FROM issues i
     JOIN users u
     ON i.reporter_id = u.id
     WHERE i.id = $1`,
    [id],
  );
  return result;
};

const updateIssueinDB = async (payload: IIssueUpdate, id: any) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `UPDATE issues SET
       title = COALESCE($1, title), description = COALESCE($2, description), type = COALESCE($3, type)
       WHERE id = $4 RETURNING *`,
    [title, description, type, id],
  );
  return result;
};

export const issueService = {
  createIssue,
  getIssues,
  getIssuebyIdfromDB,
  updateIssueinDB,
};
