import nodemailer from "nodemailer";


const GMAIL_FROM = process.env.GMAIL_FROM || "sabahatlaitf126@gmail.com";
const GMAIL_PASS = process.env.GMAIL_PASS ||"dwuw iqiw fqhk gzwh";

if (!GMAIL_FROM || !GMAIL_PASS) {
  console.error('GMAIL_FROM or GMAIL_PASS not set in environment variables');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_FROM,
    pass: GMAIL_PASS,
  },
});

export const sendOTPEmail = async (toEmail: string, otp: string): Promise<void> => {
  try {
    const mailOptions = {
      from: GMAIL_FROM,
      to: toEmail,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${toEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send OTP email.");
  }
};

export const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();
