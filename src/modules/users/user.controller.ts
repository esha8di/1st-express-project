import { type Request, type Response } from "express";
import { userService } from "./user.service";
import sendResponse from "../../utilities/sendResponse";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createuserintoDB(req.body);
    return sendResponse(res, {
      statusCode: 201,
      message: "user created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      message: "failed to create the user",
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.getuserfromDB(req.body);
    const { accessToken } = result;
    res.cookie("accessToken", accessToken, {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    });
    return sendResponse(res, {
      statusCode: 200,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      message: "something went wrong!!",
    });
  }
};

export const userController = {
  createUser,
  loginUser,
};
