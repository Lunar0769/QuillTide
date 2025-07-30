import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "QuillTide - Email Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">QuillTide Email Verification</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for signing up with QuillTide! To complete your registration, please verify your email address using the OTP below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; background-color: #e3f2fd; padding: 15px 25px; border-radius: 5px; letter-spacing: 5px;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center;">
            This OTP will expire in 10 minutes.
          </p>
          <p style="font-size: 16px; margin-top: 20px;">
            If you didn't create an account with QuillTide, please ignore this email.
          </p>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
          Best regards,<br>
          The QuillTide Team
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("OTP email sent successfully")
  } catch (error) {
    console.error("Error sending OTP email:", error)
    throw new Error("Failed to send verification email")
  }
}

export const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to QuillTide!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Welcome to QuillTide!</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello ${username},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Welcome to QuillTide! Your email has been successfully verified and your account is now active.
          </p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            You can now start creating amazing blog posts and connecting with other writers in our community.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Blogging
            </a>
          </div>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
          Happy blogging!<br>
          The QuillTide Team
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("Welcome email sent successfully")
  } catch (error) {
    console.error("Error sending welcome email:", error)
  }
}
