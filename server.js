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
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;

    if(!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found'
      });
    } else if (user) {
      if (user.password != req.body.password) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      } else {
        const payload = {
          admin: user.admin
        };
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: 1440
        });
        res.json({
          success: true,
          message: 'Enjoy your token',
          token: token 
        });
      }
    }
  });
});


// route middleware to verify token
apiRoutes.use(function(req, res, next) {
  // check for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verify secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        // save token to request
        req.decoded = decoded;
        next();
      } 
    });
  } else {
    // no token return error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

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

