import { type Request, type Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { issueService } from "./issues.service";
import { pool } from "../../db";
import sendResponse from "../../utilities/sendResponse";

const createIssue = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;
    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      decodedToken.id,
    ]);
    const reporter_id = user.rows[0].id;
    const { title, description, type } = req.body;
    const result = await issueService.createIssue(
      { title, description, type },
      reporter_id,
    );
    return sendResponse(res, {
      statusCode: 201,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, {
      statusCode: 500,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getIssue = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query as {
      sort?: string;
      type?: string;
      status?: string;
    };
    const result = await issueService.getIssues({ sort, type, status });
    return sendResponse(res, {
      statusCode: 200,
      message: "Issues retrived successfully",
      data: result.rows,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      message: "Something went wrong",
    });
  }
};

const getIssuebyId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getIssuebyIdfromDB(id);

    if (result.rows.length === 0) {
      return sendResponse(res, { statusCode: 404, message: "issue not found!!" });
    }
    return sendResponse(res, {
      statusCode: 200,
      message: "issue retrieve successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      message: "issue does not exist",
    });
  }
};

const updateIssuebyID = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;


    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      decodedToken.id,
    ]);

    const existingIssue = await issueService.getIssuebyIdfromDB(id);
    
    if (existingIssue.rows.length === 0) {
      return sendResponse(res, { statusCode: 404, message: "issue not found!!" });
    }

    if (user.rows[0].id !== existingIssue.rows[0].reporter.id) {
      return sendResponse(res, { statusCode: 403, message: "Unauthorized" });
    }

    const result = await issueService.updateIssueinDB(req.body, id);
    return sendResponse(res, {
      statusCode: 200,
      message: "issue updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      message: "Issue does not exist",
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const issue = await pool.query(`
      SELECT * FROM issues where id=$1`, [id]);

    if (issue.rows.length === 0) {
      return sendResponse(res, { statusCode: 404, message: "issue not found!!" });
    }

    const token = req.headers.authorization;
    const decodedToken = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;
    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      decodedToken.id,
    ]);
    if (user.rows[0].id !== issue.rows[0].reporter_id) {
      return sendResponse(res, { statusCode: 404, message: "issue not found!!" });
    }

    await pool.query(`DELETE FROM issues where id=$1`, [id]);
    return sendResponse(res, {
      statusCode: 200,
      message: "issue deleted successfully",
      data: issue.rows[0],
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      message: "Issue does not exist",
    });
  }
};

const updateIssuebySatus = async(req: Request, res: Response) =>{
   const { id } = req.params;
   const {status} = req.body;
   
  try {
    const issue = await pool.query(`
      SELECT * FROM issues where id=$1`, [id]);

    if (issue.rows.length === 0) {
      return sendResponse(res, { statusCode: 404, message: "issue not found!!" });
    }

    const token = req.headers.authorization;
    const decodedToken = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;
    const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      decodedToken.id,
    ]);
    

    if(user.rows[0].role ==="maintainer"){
      const result = await issueService.updateDBbyStatus({status},id);

      return sendResponse(res, {
      statusCode: 200,
      message: "status updated successfully",
      data: result.rows[0],
    });
    }
    return sendResponse(res, {
      statusCode: 401,
      message: "contributor can not able to change the status!!"
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      message: "Issue does not exist",
    });
  }

}

export const issueController = {
  createIssue,
  getIssue,
  getIssuebyId,
  updateIssuebyID,
  deleteIssue,
  updateIssuebySatus
};
