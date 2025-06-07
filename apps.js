const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { OpenAI } = require('openai');
const { sendEmergencyAlert } = require('./emergency');
const { scheduleReminder } = require('./reminders');
const { getDbInstance } = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Chat endpoint (AI powered)
app.post('/chat', async (req, res) => {
  const { message, language } = req.body;
  const prompt = `You are a friendly maternal health assistant. Reply in ${language}. Question: ${message}`;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    res.status(500).send("AI Error: " + error.message);
  }
});

// Get weekly pregnancy tips
app.get('/tips/:week', (req, res) => {
  const week = Number(req.params.week);
  const tips = require('../data/pregnancy_tips.json');
  const tipData = tips.find(t => t.week === week);
  res.json(tipData || {});
});

// Get multilingual FAQs
app.get('/faqs', (req, res) => {
  const faqs = require('../data/faqs.json');
  res.json(faqs);
});

// Emergency alert endpoint
app.post('/emergency', (req, res) => {
  const { userId, location, symptoms } = req.body;
  sendEmergencyAlert(userId, location, symptoms);
  res.json({ status: "Alert sent" });
});

// Schedule a reminder
app.post('/reminder', (req, res) => {
  const { userId, type, datetime, description } = req.body;
  scheduleReminder(userId, type, datetime, description);
  res.json({ status: "Reminder scheduled" });
});

// Clinic locator (stub, to be extended with Google Maps API)
app.get('/clinics', (req, res) => {
  // Example: Return dummy clinics
  res.json([
    { name: "Mother’s Clinic", lat: 9.0628, lng: 7.4772 },
    { name: "Safe Birth Center", lat: 9.0635, lng: 7.4800 }
  ]);
});

// Languages supported
app.get('/languages', (req, res) => {
  const langs = require('../data/languages.json');
  res.json(langs);
});

// Get all week tips for tracker
app.get('/all-tips', (req, res) => {
  const tips = require('../data/pregnancy_tips.json');
  res.json(tips);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`MamaCare backend running on port ${PORT}`));
