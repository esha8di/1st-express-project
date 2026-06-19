import { type Request, type Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { issueService } from "./issues.service";
import { pool } from "../../db";

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
    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
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
    res.status(200).json({
      success: true,
      message: "Issues retrived successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error,
    });
  }
};

const getIssuebyId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getIssuebyIdfromDB(id);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "issue not found!!" });
    }
    res.status(200).json({
      success: true,
      message: "issue retrieve successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "issue does not exist",
      error: error,
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
      return res.status(404).json({ message: "issue not found!!" });
    }
  
    if (user.rows[0].id !== existingIssue.rows[0].reporter.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result= await issueService.updateIssueinDB(req.body,id);

    res.status(200).json({
      success: true,
      message: "issue updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Issue does not exist",
      error: error,
    });
  }
};

const deleteIssue = async ( req: Request, res:Response) =>{
  const {id} = req.params;
  try{
    const issue = await pool.query(`
      SELECT * FROM issues where id=$1`,[id]);

      if(issue.rows.length===0){
        return res.status(404).json({ message: "issue not found!!" });
      }

      const result = await pool.query(`
      DELETE FROM issues where id=$1`,[id]);
      res.status(200).json({
      success: true,
      message: "issue deleted successfully",
      data: issue.rows[0],
    });

  }
  catch(error){
     res.status(500).json({
      success: false,
      message: "Issue does not exist",
    });

  }
}
export const issueController = {
  createIssue,
  getIssue,
  getIssuebyId,
  updateIssuebyID,
  deleteIssue
};
