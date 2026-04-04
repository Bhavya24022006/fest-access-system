import nodemailer from "nodemailer";

export const sendLoginEmail = async (email, password) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎟 Your Fest Login Credentials",
    html: `
      <h2>Welcome to Fest 🎉</h2>
      <p>Your account has been created.</p>

      <p><b>Email:</b> ${email}</p>
      <p><b>Password:</b> ${password}</p>

      <p>👉 Login here: http://localhost:3000/login</p>

      <p>Please change your password after login.</p>
    `,
  });
};