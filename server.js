/*
    Simple testing server for static build files
*/

const express = require('express');
const googleTTS = require('google-tts-api'); // CommonJS
const path = require('path');
const http = require('http');
const https = require('https');
const { execPath } = require('process');
const app = express();
const port = process.env.PORT || 8080;

function httpGet(url) {
  return new Promise((resolve, reject) => {

    let client = http;

    if (url.toString().indexOf("https") === 0) {
      client = https;
    }

    client.get(url, (resp) => {
      let chunks = [];

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        chunks.push(chunk);
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

    }).on("error", (err) => {
      reject(err);
    });
  });
}

/* routes */
app.get('/ttsurl', async (req, res) => {
  console.log("TTS request: ", req.query);

  // get audio URL
  const url = googleTTS.getAudioUrl(Buffer.from(req.query.line, 'base64').toString(), {
    lang: Buffer.from(req.query.voice || btoa("en"), 'base64').toString(),
    slow: (typeof req.query.slow === 'undefined') ? false : (req.query.slow=='1'),
    host: 'https://translate.google.com',
  });

  var buf = new ArrayBuffer();
  try {
    buf = await httpGet(url);
  } catch (err) {
    console.log("Error: "+err)
  }

  res.json({ url: "data:audio/wav;base64," + buf.toString("base64") });
})

app.use('/', express.static(path.join(__dirname, 'public')))

/* start server */
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})