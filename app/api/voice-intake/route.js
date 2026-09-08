// Bermuda AI Staffing - Call 14417038294 forwarded to 13202273328 -> AI -> WhatsApp 14415338294
app.all('/api/voice-intake', (req,res)=>{
  const from = req.body.From;
  res.type('text/xml').send(`<Response>
    <Say voice="Polly.Joanna">Hi, you've reached Bermuda AI Staffing, Bermuda's first and only full-stack AI employee agency.</Say>
    <Say>Our team is on another call. Please say your name, business, and what you need after the beep, and we'll WhatsApp you back within fifteen minutes.</Say>
    <Record maxLength="45" transcribe="true" transcribeCallback="/api/whatsapp-it?From=${from}" action="/api/bye"/>
  </Response>`);
});

app.all('/api/bye', (req,res)=>{
  res.type('text/xml').send(`<Response><Say>Thanks, we got it. We'll be in touch shortly.</Say><Hangup/></Response>`);
});

app.all('/api/whatsapp-it', async (req,res)=>{
  const text = req.body.TranscriptionText || 'voicemail left';
  const from = req.query.From || req.body.From;
  const rec = req.body.RecordingUrl;
  await client.messages.create({
    from: 'whatsapp:+14417038294', // BUSINESS WhatsApp
    to: 'whatsapp:+14415338294',   // YOU on WiFi
    body: `🤖 Bermuda AI Staffing - New Lead\nCall to 14417038294 (fwd to 320)\nFrom: ${from}\nNeed: "${text}"\nAudio: ${rec}\nCallback: ${from}`
  });
  res.sendStatus(200);
});
