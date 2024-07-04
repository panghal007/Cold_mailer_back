const Email = require('../models/emailSchema');
const User = require('../models/User');

const Template = require('../models/templateSchema');
const path = require('path');
const nodemailer = require('nodemailer');
const Agenda = require('agenda');
require('dotenv').config();

const agenda = new Agenda({ db: { address: process.env.MONGO_URI } });

agenda.define('send email', async (job) => {
  const { emailId, userId } = job.attrs.data;

  const email = await Email.findById(emailId);
  if (!email) {
    console.error('Email not found');
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error('User not found');
    return;
  }

  const { emailFrom, emailPass } = user;
  if ( !emailFrom || !emailPass) {
    console.error('User email credentials not found');
    return;
  }

  const trackingPixelUrl = `https://cold-mailer-back.onrender.com/api/track/${emailId}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailFrom,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: emailFrom,
    to: email.to,
    subject: email.subject,
    text: email.body,
    html: `${email.body}<img src="${trackingPixelUrl}" alt="" style="display:none;" />`,
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
  const { to, subject, body, delay, templateId, userId } = req.body; // Ensure userId is passed in the request body
  const delayInMinutes = parseInt(delay, 10);
  const scheduledAt = new Date(Date.now() + delayInMinutes * 60000);

  let emailTo = to;
  let emailSubject = subject;
  let emailBody = body;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (templateId) {
      const template = await Template.findById(templateId);
      if (template) {
        emailTo = template.to;
        emailSubject = template.subject;
        emailBody = template.body;
      } else {
        return res.status(404).json({ error: 'Template not found' });
      }
    }

    const email = new Email({
      to: emailTo,
      subject: emailSubject,
      body: emailBody,
      delay: delayInMinutes,
      scheduledAt,
      userId, // Store userId in the email document
    });

    await email.save();
    await agenda.start();

    await agenda.schedule(scheduledAt, 'send email', { emailId: email._id, userId });

    res.status(200).json({ message: 'Email scheduled successfully', emailId: email._id });
  } catch (error) {
    console.error('Error scheduling email:', error);
    res.status(500).json({ error: 'Error scheduling email' });
  }
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
  const { name, to, subject, body ,userId} = req.body;

  try {
    const template = new Template({
      name,
      to,
      subject,
      body,
      userId,
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
    const {userId} = req.params;
    console.log(userId);
    const templates = await Template.find({ userId});
    console.log(templates);
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
