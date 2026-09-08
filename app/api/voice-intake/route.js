// app/api/voice-intake/route.js - FOR LEXAI.LLC
export async function POST() {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    Hi, you've reached AI Support Systems by Dollar Double Empire in Bermuda.
    We install AI receptionists so you never miss a call. We answer instantly, explain your services, and book appointments straight into your calendar.
    Our AI can answer common questions, qualify leads, and forward hot calls to you.
    Stay on the line to see a live demo, and I'll connect you to our team now.
  </Say>
  <Dial callerId="+13202273328">
    <Number>+14417038294</Number>
  </Dial>
</Response>`;

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function GET() {
  return POST();
}
