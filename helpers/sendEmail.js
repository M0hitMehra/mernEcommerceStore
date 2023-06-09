import { createTransport } from "nodemailer";

export const sendEmail = async (subject, to, text) => {
  const transport = createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
        user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  await transport.sendMail({
    to,
    subject,
    text,
    from: process.env.SMPT_MAIL,
  });
};
