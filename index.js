const express = require('express');
// var favicon = require('serve-favicon')
// var path = require('path')



const app = express();
const PORT = 5000;

app.use(express.static('public'));
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.listen(PORT, () => {
    console.log('Listening on: ' + PORT);
});