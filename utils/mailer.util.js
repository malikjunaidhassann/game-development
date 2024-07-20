/* eslint-disable no-console */
import fs from "fs";
import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";
import config from "../config.js";

const Mailer = {
  async sendVerificationEmail({ email, name, code }) {
    const options = {
      to: `"${name}" <${email}>`,
      subject: "Verify Your Email",
    };
    const data = {
      name,
      code,
      link: `${config.appUrl}/verify-email?code=${code}`,
    };
    const res = await this.sendEmail({ file: "verifyEmail", options, data });

    return res;
  },

  async sendPasswordResetEmail({ email, name, resetCode }) {
    const options = { to: `"${name}" <${email}>`, subject: "Reset Password" };
    const data = {
      name,
      code: resetCode,
      link: `${config.appUrl}/reset-password?email=${email}&resetCode=${resetCode}`,
    };
    const res = await this.sendEmail({ file: "resetPassword", options, data });

    return res;
  },

  async sendEmail({ data = {}, options = {}, file }) {
    return new Promise((resolve) => {
      const { user, pass } = config.mailer;
      const templatePath = path.join(`views/${file}.view.ejs`);
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user, pass },
      });

      // eslint-disable-next-line consistent-return
      fs.readFile(templatePath, "utf8", (err, template) => {
        if (err) {
          console.log("Error reading email template:", { err });
          return resolve([null, err]);
        }
        const html = ejs.render(template, data);
        const mailOptions = { from: `"Carrom" <${user}>`, html, ...options };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.log("Error sending email:", { error });
          else console.log("Email sent:", info.response);

          return resolve([info, error]);
        });
      });
    });
  },
};

export default Mailer;
