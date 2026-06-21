import { Router } from "express";
import auth from "../../middleware/auth";
import { issueController } from "./issues.controller";

export const router = Router();

router.post("/", auth("contributor", "maintainer"), issueController.createIssue);
router.get("/", issueController.getIssue);
router.get("/:id", issueController.getIssuebyId);
router.put("/:id",auth("contributor", "maintainer"),issueController.updateIssuebyID);
router.patch("/:id/status",auth("contributor", "maintainer"),issueController.updateIssuebySatus);
router.delete("/:id",auth("contributor", "maintainer"), issueController.deleteIssue)
const issueRouter = router;
export default issueRouter;
