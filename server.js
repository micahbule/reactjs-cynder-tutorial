var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var JsonStore = require('simple-json-store');
var shortid = require('shortid');
var app = express();

var COMMENTS_FILE = path.join(__dirname, 'products.json');

var jsonStore = new JsonStore(COMMENTS_FILE);

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/products', function (req, res) {
  return res.json(toArray(jsonStore.all));
});

app.post('/api/products', function (req, res) {
  var newComment = {
    name: req.body.name,
    price: req.body.price
  };

  jsonStore.set(shortid.generate(), newComment);

  return res.json(toArray(jsonStore.all));
});

app.put('/api/products/:id', function (req, res) {
  var product = {
    name: req.body.name,
    price: req.body.price
  };

  jsonStore.set(req.params.id, product);

  return res.json(toArray(jsonStore.all));
});

app.delete('/api/products/:id', function (req, res) {
  jsonStore.del(req.params.id);

  return res.json(toArray(jsonStore.all));
})

function toArray(products) {
  var productArray = [];

  for (key in products) {
    products[key].id = key;
    productArray.push(products[key]);
  }

  return productArray;
}

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
