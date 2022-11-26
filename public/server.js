const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build', 'static')));

app.get('/static/*', function (req, res) {
  res.sendFile(path.join(__dirname, req.originalUrl));
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', function (req, res) {
    res.redirect('/');
});

app.listen(9900, function(req, res) {
  console.log('Costa Barcodes listening on port: 9900');
});