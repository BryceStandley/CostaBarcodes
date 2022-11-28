const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build', 'static')));

app.get('/static/*', function (req, res) {
  console.log('Sending: {0}', req.originalUrl)
  res.sendFile(path.join(__dirname, req.originalUrl));
  
});

app.get('/assets/*', function (req, res) {
  console.log('Sending: {0}', req.originalUrl)
  res.sendFile(path.join(__dirname, req.originalUrl));
});

app.get('/', function (req, res) {
  console.log('Sending: {0}', req.originalUrl)

  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', function (req, res) {
    console.log('Redirect to / from request: {0}', req.originalUrl)
    res.redirect('/');
});

app.listen(9900, function(req, res) {
  console.log('Costa Barcodes listening on port: 9900');
});