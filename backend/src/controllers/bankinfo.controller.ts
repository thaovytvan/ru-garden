import { Request, Response } from "express";

export const getBankInfo = (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      bankName: process.env.BANK_NAME || "Vietcombank",
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || "1234567890",
      accountHolder: process.env.BANK_ACCOUNT_HOLDER || "NGUYEN VAN A",
      branch: process.env.BANK_BRANCH || "Chi nhánh HCM",
    }
  });
};
