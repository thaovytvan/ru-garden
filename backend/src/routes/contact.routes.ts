import { Router } from "express";
import { createContactMessage, getContactMessages } from "../controllers/contact.controller";

export const contactRouter = Router();

contactRouter.post("/", createContactMessage);
contactRouter.get("/", getContactMessages); // In production, this should be admin-only
