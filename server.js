var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer');

var app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));


app.use(multer({ dest: './public/upload/'}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));

app.use('/json', require('./routes/json'));

app.use('/hook', require('./routes/hook'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: {}
//     });
// });

process.env.NPM_CONFIG_PRODUCTION && (process.env.NPM_CONFIG_PRODUCTION = true);

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);

var server = app.listen(app.get('port'), process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0", function() {
   console.log('Express server listening on port ' + server.address().port);
});

// var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
// console.log('port:' + port);

// var http = require('http');
// process.env.NPM_CONFIG_PRODUCTION && (process.env.NPM_CONFIG_PRODUCTION = true);
// // app.listen(process.env.OPENSHIFT_NODEJS_PORT || 3001, process.env.OPENSHIFT_NODEJS_PORT || 3000);
// http.createServer(app).listen(port, process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1", function(){
//   console.log("Express server listening on port " + port);
// });

// module.exports = app;
