import nodemailer from 'nodemailer'

export default async function sendEmail(
  to: string,
  subject: string,
  html?: string,
  text?: string
) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to,
      subject,
      html,
      text,
    })
  } catch (error) {
    console.log(error)
  }
}
