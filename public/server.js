const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config({path: path.resolve(__dirname, '../.env'), debug: true});

if(process.env.REACT_APP_IS_PROD === '1')//Is in production mode
{
  console.log('Server environment: Production');
  app.use(express.static('build'));
  app.get('*', (req, res) => {
    const p = path.join(__dirname, 'index.html');
    console.warn('Unknown path... Sending index.html...');
    res.sendFile(p);
  })
}
else
{
  console.log('Server environment: Development');
  app.use(express.static('build'));
  app.get('/*', function (req, res) {
    const p = path.join(__dirname, 'index.html');
    console.warn('Unknown path:', req.originalUrl, ' Sending: ', p)
    res.sendFile(p);
});
}


app.listen(9900, function(req, res) {
  console.log('Costa Barcodes listening on port: 9900');
});