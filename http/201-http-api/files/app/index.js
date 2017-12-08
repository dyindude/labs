var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api', function(req, res){
   res.send("Hello world!");
});

app.post('/api', function(req, res) {
   res.send(JSON.stringify(req.body));
});

app.listen(3000);
