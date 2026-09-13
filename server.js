const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname));
app.get('/business', (req,res) => res.sendFile(path.join(__dirname,'business','index.html')));
app.get('/business/*', (req,res) => {
  const fs = require('fs');
  const file = path.join(__dirname, req.path);
  if (fs.existsSync(file)) return res.sendFile(file);
  res.sendFile(path.join(__dirname,'business','index.html'));
});
app.get('/offer', (req,res) => res.sendFile(path.join(__dirname,'offer','index.html')));
app.get('/offer/*', (req,res) => res.sendFile(path.join(__dirname,'offer','index.html')));
app.get('/rental-waiver', (req,res) => res.sendFile(path.join(__dirname,'rental-waiver','index.html')));
app.get('/', (req,res) => {
  const fs = require('fs');
  if (fs.existsSync(path.join(__dirname,'index.html'))) return res.sendFile(path.join(__dirname,'index.html'));
  if (fs.existsSync(path.join(__dirname,'Index.html'))) return res.sendFile(path.join(__dirname,'Index.html'));
  res.sendFile(path.join(__dirname,'business','index.html'));
});
app.listen(PORT, '0.0.0.0', () => console.log(LexAI serving on +PORT));
