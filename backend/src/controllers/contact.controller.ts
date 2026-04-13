import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { EmailService } from "../services/email.service";

export const createContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ message: "Vui lòng điền đầy đủ các thông tin bắt buộc." });
      return;
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || "",
        message
      }
    });

    // Send asynchronous email notifications
    EmailService.sendContactNotification({ name, email, phone, message });
    EmailService.sendThankYouEmail(email, name);

    res.status(201).json({
      message: "Cảm ơn bạn đã liên hệ! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất có thể.",
      data: newMessage
    });
  } catch (err) {
    next(err);
  }
};

export const getContactMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json({ data: messages });
  } catch (err) {
    next(err);
  }
};
