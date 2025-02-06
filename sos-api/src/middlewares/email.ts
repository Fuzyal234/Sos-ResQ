import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: 'sabahatlaitf126@gmail.com', 
        pass: 'nwpo zbud moxb tcqk',   
      },
      tls: {
        rejectUnauthorized: false, 
      }
    });
  
    const mailOptions = {
      from: 'sabahatlaitf126@gmail.com', 
      to, 
      subject,  
      html, 
    };
  
    try {
      await transporter.sendMail(mailOptions); 
      console.log('Email sent successfully to:', to);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Email sending failed');
    }
  };


export const otpStore: {
    [email: string]: {
      otp: string;
      expiresAt: number;
    };
  } = {};
  