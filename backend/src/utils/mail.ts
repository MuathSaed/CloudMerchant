import nodemailer from 'nodemailer';

let transport = nodemailer.createTransport({
    host: process.env.REAL_EMAIL_SERVICE,
    port: 587,
    auth: {
      user: process.env.REAL_EMAIL,
      pass: process.env.REAL_EMAIL_PASS
    }
});

let sendVerificationEmail = async (name:string, email: string, link: string) => {
    await transport.sendMail({
        from: `"CloudMerchant" ${process.env.REAL_EMAIL}`,
        to: email,
        subject: "Account Verification",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #0066cc;">Email Verification</h2>
            <p>Dear ${name},</p>
            <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
            <a href=${link} style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br/>CloudMerchant</p>
            </div>
        `
    });
}

let sendPasswordResetLink = async (name:string, email: string, link: string) => {
    await transport.sendMail({
        from: `"CloudMerchant" ${process.env.REAL_EMAIL}`,
        to: email,
        subject: "Password Reset Request",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #d9534f;">Password Reset Request</h2>
            <p>Dear ${name},</p>
            <p>You requested a password reset. Please click the link below to reset your password:</p>
            <a href=${link} style="background-color: #d9534f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br/>CloudMerchant</p>
            </div>
        `
    });
}

let sendPasswordUpdateMessage = async (name:string, email: string) => {
    await transport.sendMail({
        from: `"CloudMerchant" ${process.env.REAL_EMAIL}`,
        to: email,
        subject: "Password Reset Successful",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #28a745;">Password Reset Successful</h2>
            <p>Dear ${name},</p>
            <p>Your password has been successfully reset. You can now log in with your new password.</p>
            <p>If you did not request this change, please contact our support team immediately.</p>
            <p>Best regards,<br/>CloudMerchant</p>
            </div>
        `
    });
}

let mail = { sendVerificationEmail, sendPasswordRestLink: sendPasswordResetLink, sendPasswordUpdateMessage };

export default mail;