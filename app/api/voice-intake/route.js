// pages/api/voice-intake.js - Fully working AI receptionist for LexAI
export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">
    Hi, you've reached A-I Support Systems, by Dollar Double Empire in Bermuda.
    We install A-I receptionists for local businesses so you never miss a call.
    We answer instantly, explain your services, and book appointments straight into your calendar.
    Our A-I can book clients, answer FAQs, and forward hot leads to your cell.
    To see a demo, stay on the line and I'll connect you now.
  </Say>
  <Dial callerId="+13202273328">+14417038294</Dial>
</Response>`;

  res.status(200).send(twiml);
}
