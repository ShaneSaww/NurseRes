// server.js
//Add the cluster files, so we can use more than a single thread. 
var cluster =  require('cluster');
if( cluster.isMaster) {
	//Count dem CPUS
	var cpuCount = require('os').cpus().length;
	// Create a worker for half the CPUs
	for ( var i = 0; i < cpuCount/2 ; i+=1) {
		cluster.fork();
	}
	// Listen for dying workers
	cluster.on('exit', function (worker) {

    // Replace the dead worker, we're not sentimental
    console.log('Worker ' + worker.id + ' died :(');
    cluster.fork();

});
}
else { 
// load the things we need
var express = require('express');
var async = require('async');
var app = express();
var envConfig = require('config');
var bodyParser = require('body-parser')

//#### Lets Set up the Express engine  ####//
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Add info connection info.
var CFG_SERVER      = envConfig.server;
var CFG_DB_MYSQL    = envConfig.dbMysql;
var CFG_TWITTER 	= envConfig.Twitter;
var port            = process.env.PORT || CFG_SERVER.port;
// Set the directories of any JS or CSS files 
app.use(express.static(__dirname + '/public'));
//Set up some routes, this will create webpages and keep our main code block clean
var em = require('./routes/em'); 
var routes = require('./routes/index');
//########################//
// Set up some Database stuff, Pooled connection to mysql 
//Adding DB variables
var mysql  =require('mysql');
var db = null;
//DB Setup and pooled connection
 db = mysql.createPool({
  host     : CFG_DB_MYSQL.host,
  database : CFG_DB_MYSQL.database,
  user     : CFG_DB_MYSQL.user,
  password : CFG_DB_MYSQL.password,
  connectionLimit : CFG_DB_MYSQL.connectionLimit,
  waitForConnections : CFG_DB_MYSQL.waitForConnections 
});
//Tweet Tweet Motherfucker
//Setup twitter for the tweet of the day
var util = require('util');
var twit = require('twit');
var T = new twit({
  consumer_key: CFG_TWITTER.consumer_key,
  consumer_secret: CFG_TWITTER.consumer_secret,
  access_token: CFG_TWITTER.access_token_key,
  access_token_secret: CFG_TWITTER.access_token_secret
});

// Add the DB and Twitter accessibility into the router 
app.use(function(req, res, next) {
	req.db = db;
	req.T = T;
	next();
});

//Use the routes dir for the other node files. 
// The  other node files will call app.get to display text on the pages
app.use('/', routes);

//##############//
//Error Handling 
app.use(function(req, res, next) {
    var err = new Error('There is no page.');
    err.status = 404;
    next(err);
});

// error handlers
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});





app.listen(port);
//console.log('8080 is the magic port ');
console.log('8080 is the magic port for worker' + cluster.worker.id);
}
module.exports = app;