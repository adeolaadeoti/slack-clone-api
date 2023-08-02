import nodemailer from "nodemailer";

export default async function sendEmail(
  to: string,
  subject: string,
  html?: string,
  text?: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `no reply <noreply@slack-clone.vercel.app>`,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.log(error);
  }
}
