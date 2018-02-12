var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt     = require('jsonwebtoken');
var config  = require('./config.js');
var User    = require('./app/models/user.js');

var port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// use morgan to log requests to console
app.use(morgan('dev'));

// basic route
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.get('/setup', function(req, res) {
  // create a sample user
  var udin = new User({
    name: 'udin',
    password: 'password',
    admin: true
  });

  udin.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully!');
    res.json({success: true});
  });
});

// API ROUTES -----------------------------------

var apiRoutes = express.Router();

// route to authenticate user


// route middleware to verify token


// route to show a random message
apiRoutes.get('/', function(req, res) {
  res.json({message: 'Welcome to the coolest API on earth'});
});

// route to return all users
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

// apply the routes with the prefix /api
app.use('/api', apiRoutes);


app.listen(port);
console.log('Magic happens at http://localhost:' + port);

