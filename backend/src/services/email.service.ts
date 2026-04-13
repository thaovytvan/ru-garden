import nodemailer from "nodemailer";

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  static async sendContactNotification(data: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }) {
    const mailOptions = {
      from: `"Rú Garden System" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || "hello.rugarden@gmail.com",
      subject: `🌿 Yêu cầu liên hệ mới từ ${data.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #4F772D; border-bottom: 2px solid #4F772D; padding-bottom: 10px;">Yêu cầu liên hệ mới</h2>
          <p>Bạn vừa nhận được một tin nhắn mới từ khách hàng qua form liên hệ trên website <strong>Rú Garden</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Họ tên:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Số điện thoại:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone}</td>
            </tr>
          </table>

          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <p style="margin-top: 0; font-weight: bold;">Nội dung lời nhắn:</p>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>

          <p style="font-size: 12px; color: #888; margin-top: 30px; text-align: center;">
            Đây là email tự động từ hệ thống Rú Garden. Vui lòng không trả lời trực tiếp email này.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("✅ Contact notification email sent successfully");
    } catch (err) {
      console.error("❌ Failed to send contact notification email:", err);
      // We don't throw error here to avoid breaking the contact form flow
    }
  }

  static async sendThankYouEmail(customerEmail: string, customerName: string) {
    const mailOptions = {
      from: `"Rú Garden" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Cảm ơn bạn đã liên hệ với Rú Garden`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #4F772D;">Chào ${customerName},</h2>
          <p>Cảm ơn bạn đã quan tâm và để lại lời nhắn cho <strong>Rú Garden</strong>.</p>
          <p>Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi lại trong vòng 24 giờ làm việc.</p>
          <p>Trong lúc chờ đợi, bạn có thể tham khảo thêm các mẫu cây mới nhất tại website của chúng tôi.</p>
          <br />
          <p>Thân mến,</p>
          <p><strong>Đội ngũ Rú Garden</strong></p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (err) {
      console.error("❌ Failed to send thank you email:", err);
    }
  }
}
