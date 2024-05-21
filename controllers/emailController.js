const Email = require('../models/emailSchema');
const nodemailer = require('nodemailer');
const Agenda = require('agenda');
require('dotenv').config();

const agenda = new Agenda({ db: { address: process.env.MONGO_URI } });

agenda.define('send email', async (job) => {
  const { emailId } = job.attrs.data;

  const email = await Email.findById(emailId);
  if (!email) {
    console.error('Email not found');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email.to,
    subject: email.subject,
    text: email.body,
  };

  try {
    await transporter.sendMail(mailOptions);
    email.status = 'sent';
    email.sentAt = new Date();
    await email.save();
    console.log('Email sent successfully');
  } catch (error) {
    email.status = 'failed';
    await email.save();
    console.error('Error sending email:', error);
  }
});

exports.scheduleEmail = async (req, res) => {
  const { to, subject, body, delay } = req.body;
  const delayInMinutes = parseInt(delay, 10);
  const scheduledAt = new Date(Date.now() + delayInMinutes * 60000);

  const email = new Email({
    to,
    subject,
    body,
    delay: delayInMinutes,
    scheduledAt,
  });

  await email.save();
  await agenda.start();

  await agenda.schedule(scheduledAt, 'send email', { emailId: email._id });

  res.status(200).json({ message: 'Email scheduled successfully' , emailId: email._id});
};

exports.getEmailStatus = async (req, res) => {
  try {
    const emails = await Email.find();
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching email statuses'
    });
  }
};
