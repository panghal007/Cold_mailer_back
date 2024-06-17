const Email = require('../models/emailSchema');
const Template = require('../models/templateSchema');
const path = require('path');
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

  const trackingPixelUrl = `${process.env.SERVER_URL}/api/track/${emailId}`;

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
    html: `${email.body}<img src="${trackingPixelUrl}" alt=""  style="display:none;" />`,
    };
  console.log('Sending email with HTML content:', mailOptions.html);


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
  const { to, subject, body, delay, templateId } = req.body;
  const delayInMinutes = parseInt(delay, 10);
  const scheduledAt = new Date(Date.now() + delayInMinutes * 60000);

  let emailSubject = subject;
  let emailBody = body;

  if (templateId) {
    const template = await Template.findById(templateId);
    if (template) {
      emailSubject = template.subject;
      emailBody = template.body;
    } else {
      return res.status(404).json({ error: 'Template not found' });
    }
  }

  const email = new Email({
    to,
    subject: emailSubject,
    body: emailBody,
    delay: delayInMinutes,
    scheduledAt,
  });

  await email.save();
  await agenda.start();

  await agenda.schedule(scheduledAt, 'send email', { emailId: email._id });

  res.status(200).json({ message: 'Email scheduled successfully', emailId: email._id });
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

// Create a new template
exports.createTemplate = async (req, res) => {
  const { name, subject, body } = req.body;

  try {
    const template = new Template({
      name,
      subject,
      body,
    });

    await template.save();
    res.status(201).json({ message: 'Template created successfully', template });
  } catch (error) {
    res.status(500).json({ error: 'Error creating template' });
  }
};

// Get all templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching templates' });
  }
};

exports.trackEmailOpened = async (req, res) => {
  const { emailId } = req.params;
  console.log(req.params);
  try {
    // Find the email by ID and update its status to "opened" if it hasn't been opened yet
    const email = await Email.findById(emailId);
    console.log(email);
    if (email && !email.openedAt) {
      email.openedAt = new Date();
      email.status = 'opened';
      await email.save();
    }
  } catch (error) {
    console.error('Error tracking email:', error);
  }

  // Serve the tracking pixel image
  const pixelPath = path.join(__dirname, '../public/pixel.png');
  res.sendFile(pixelPath);
};