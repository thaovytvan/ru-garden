import { Router } from "express";
import { getBankInfo } from "../controllers/bankinfo.controller";

export const bankinfoRouter = Router();

bankinfoRouter.get("/", getBankInfo);
