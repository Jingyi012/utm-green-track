import nodemailer from 'nodemailer';

export async function sendResetEmail(name: string, email: string, resetUrl: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_FROM,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"UTM Green Track" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
      <p>Thanks,<br/>UTM Green Track Team</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    } catch (error: any) {
        console.error('Error sending reset email:', error);
        throw new Error('Failed to send reset email.');
    }
}
