import { Router } from "express";
import auth from "../../middleware/auth";
import { issueController } from "./issues.controller";

export const router = Router();

router.post("/", auth("contributor", "maintainer"), issueController.createIssue);
router.get("/", issueController.getIssue);
router.get("/:id", issueController.getIssuebyId);
router.put("/:id",auth("contributor", "maintainer"),issueController.updateIssuebyID)
const issueRouter = router;
export default issueRouter;
