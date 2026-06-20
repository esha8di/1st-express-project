// src/app.ts
import express from "express";
import { Router as Router3 } from "express";
import cookieParser from "cookie-parser";

// src/modules/users/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});
var config = {
  port: Number(process.env.PORT),
  connectionString: process.env.CONNECTION_STRING,
  secret: process.env.SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connectionString
});
var initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS USERS (
            ID SERIAL PRIMARY KEY,
            NAME VARCHAR(255) NOT NULL,
            EMAIL VARCHAR(255) NOT NULL UNIQUE,
            ROLE VARCHAR(20) NOT NULL DEFAULT 'contributor',
            CHECK (ROLE IN ('contributor','maintainer')),
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

// src/modules/users/user.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var createuserintoDB = async (payload) => {
  const { name, email, role, password } = payload;
  const hashPassword = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users(name,email,role,password) VALUES($1,$2,COALESCE($3,'contributor'),$4) RETURNING id,name,email,role,created_at,updated_at`,
    [name, email, role, hashPassword]
  );
  return result;
};
var getuserfromDB = async (payload) => {
  const { email, password } = payload;
  const user = await pool.query(
    `SELECT * FROM users WHERE email=$1`,
    [email]
  );
  if (user.rows.length === 0) {
    throw new Error("Invalid credential!");
  }
  const comparePassword = await bcrypt.compare(password, user.rows[0].password);
  if (!comparePassword) {
    throw new Error("Invalid credential!");
  }
  const jwtPayload = {
    id: user.rows[0].id,
    name: user.rows[0].name,
    role: user.rows[0].role
  };
  const accessToken = jwt.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  return {
    accessToken,
    user: {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      role: user.rows[0].role,
      created_at: user.rows[0].created_at,
      updated_at: user.rows[0].updated_at
    }
  };
};
var userService = {
  createuserintoDB,
  getuserfromDB
};

// src/utilities/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    message: data.message,
    data: data.data
  });
};
var sendResponse_default = sendResponse;

// src/modules/users/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createuserintoDB(req.body);
    return sendResponse_default(res, {
      statusCode: 201,
      message: "user created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      message: "failed to create the user"
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await userService.getuserfromDB(req.body);
    const { accessToken } = result;
    res.cookie("accessToken", accessToken, {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    });
    return sendResponse_default(res, {
      statusCode: 200,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      message: "something went wrong!!"
    });
  }
};
var userController = {
  createUser,
  loginUser
};

// src/modules/users/user.route.ts
var router = Router();
router.post("/signup", userController.createUser);
router.post("/login", userController.loginUser);
var userrouter = router;
var user_route_default = userrouter;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        message: "unauthorized access !!"
      });
    }
    const decodedToken = jwt2.verify(
      token,
      config_default.secret
    );
    const user = await pool.query(
      `
            SELECT * FROM users where id = $1`,
      [decodedToken.id]
    );
    if (user.rows.length === 0) {
      return res.status(401).json({
        message: "user not found !!"
      });
    }
    if (user.rows.length && !roles.includes(user.rows[0].role)) {
      return res.status(401).json({
        message: "This user does not have the access!!"
      });
    }
    next();
  };
};
var auth_default = auth;

// src/modules/issues/issues.controller.ts
import jwt3 from "jsonwebtoken";

// src/modules/issues/issues.service.ts
var createIssue = async (payload, reporter_id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `INSERT INTO issues (title, description, type, status, reporter_id) VALUES($1,$2,COALESCE($3,'bug'),'open',$4) RETURNING id,title,description,type,status,reporter_id,created_at,updated_at`,
    [title, description, type, reporter_id]
  );
  return result;
};
var getIssues = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = `SELECT * FROM issues WHERE 1=1`;
  const values = [];
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
var getIssuebyIdfromDB = async (id) => {
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
    [id]
  );
  return result;
};
var updateIssueinDB = async (payload, id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `UPDATE issues SET
       title = COALESCE($1, title), description = COALESCE($2, description), type = COALESCE($3, type)
       WHERE id = $4 RETURNING *`,
    [title, description, type, id]
  );
  return result;
};
var issueService = {
  createIssue,
  getIssues,
  getIssuebyIdfromDB,
  updateIssueinDB
};

// src/modules/issues/issues.controller.ts
var createIssue2 = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt3.verify(
      token,
      config_default.secret
    );
    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      decodedToken.id
    ]);
    const reporter_id = user.rows[0].id;
    const { title, description, type } = req.body;
    const result = await issueService.createIssue(
      { title, description, type },
      reporter_id
    );
    return sendResponse_default(res, {
      statusCode: 201,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    return sendResponse_default(res, {
      statusCode: 500,
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
var getIssue = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const result = await issueService.getIssues({ sort, type, status });
    return sendResponse_default(res, {
      statusCode: 200,
      message: "Issues retrived successfully",
      data: result.rows
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      message: "Something went wrong"
    });
  }
};
var getIssuebyId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getIssuebyIdfromDB(id);
    if (result.rows.length === 0) {
      return sendResponse_default(res, { statusCode: 404, message: "issue not found!!" });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      message: "issue retrieve successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      message: "issue does not exist"
    });
  }
};
var updateIssuebyID = async (req, res) => {
  const { id } = req.params;
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt3.verify(
      token,
      config_default.secret
    );
    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      decodedToken.id
    ]);
    const existingIssue = await issueService.getIssuebyIdfromDB(id);
    if (existingIssue.rows.length === 0) {
      return sendResponse_default(res, { statusCode: 404, message: "issue not found!!" });
    }
    if (user.rows[0].id !== existingIssue.rows[0].reporter.id) {
      return sendResponse_default(res, { statusCode: 403, message: "Unauthorized" });
    }
    const result = await issueService.updateIssueinDB(req.body, id);
    return sendResponse_default(res, {
      statusCode: 200,
      message: "issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      message: "Issue does not exist"
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await pool.query(`
      SELECT * FROM issues where id=$1`, [id]);
    if (issue.rows.length === 0) {
      return sendResponse_default(res, { statusCode: 404, message: "issue not found!!" });
    }
    const token = req.headers.authorization;
    const decodedToken = jwt3.verify(
      token,
      config_default.secret
    );
    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      decodedToken.id
    ]);
    if (user.rows[0].id !== issue.rows[0].reporter_id) {
      return sendResponse_default(res, { statusCode: 404, message: "issue not found!!" });
    }
    await pool.query(`DELETE FROM issues where id=$1`, [id]);
    return sendResponse_default(res, {
      statusCode: 200,
      message: "issue deleted successfully",
      data: issue.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      message: "Issue does not exist"
    });
  }
};
var issueController = {
  createIssue: createIssue2,
  getIssue,
  getIssuebyId,
  updateIssuebyID,
  deleteIssue
};

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", auth_default("contributor", "maintainer"), issueController.createIssue);
router2.get("/", issueController.getIssue);
router2.get("/:id", issueController.getIssuebyId);
router2.put("/:id", auth_default("contributor", "maintainer"), issueController.updateIssuebyID);
router2.delete("/:id", auth_default("contributor", "maintainer"), issueController.deleteIssue);
var issueRouter = router2;
var issues_route_default = issueRouter;

// src/app.ts
var app = express();
var router3 = Router3();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router3);
app.use("/api/auth", user_route_default);
app.use("/api/issues", issues_route_default);
var app_default = app;

// src/server.ts
var port = config_default.port;
var main = async () => {
  try {
    await initDB();
    app_default.listen(port, () => {
      console.log(`server is running on ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
main();
//# sourceMappingURL=server.js.map