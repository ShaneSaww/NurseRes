var express = require('express');
var router = express.Router();
var async = require('async');
/* GET home page. */
router.get('/em', function(req, res) {
		var db = req.db;
		//db.connect();
		//We will use async parallel to keep performance up. 
		//What this is going to do is call each one of the functions, and then wait for them all to return
		//once they all return we will do the last part of the async which will be to render the webpage. 
		//mysql should be able to withstand the heat. 
		async.parallel([
		function(callback) {
			getBlog(db,callback)
		},	
		function(callback) {
			getPic(db,callback);
		},
			function(callback) {
			getEdu(db,callback);
		},
			function(callback) {
			getArticles(db,callback);
		}
		], function(err) {
			if(err) {
				throw err;
			}
			
			res.render('em',	
			{
				Brows : Brow,
				Prow : Prow,
				Arow : Arow,
				Erow : Erow
			});
		});
		//db.end();
});

/*
#############################################################################
##Functions 						   										#
##									  										#
##These are mostly queries 			  										#
## No Returns only callbacks, and they set varibles to be used in the HTML  #
##	List:								  									#								   
##	getPic	returns the content related to pics/Nurseoftheweek				#								   
##	getBlog		returns content related to Blog info         				#									   
##	getEdu		returns content related to educational info					#
##	getArticles		returns content related to news info					#										   
###########################################################################
*/

function getPic(db,callback) 
{
	//get a connection from the DB pool to use
	db.getConnection(function(err,connection) 
	{
		//If err return the error and leave this place
		if (err) { 
			callback(err); 
			return;
		}
		//Connection is good, lets query the DB
		connection.query("SELECT * from TopContent where Type = 'Pic'", function(err, rows, fields) {
			if (err) { 
				callback(err); 
				return;
			}
			Prow = rows;
			//console.log("in Pic")
			//Release the connection and leave this place
			connection.release();
			callback();
		})
	})
}

function getBlog(db,callback) 
{
	db.getConnection(function(err,connection) 
	{
		//If err return the error and leave this place
		if (err) { 
			callback(err); 
			return;
		}
		connection.query("SELECT * from TopContent where Type = 'Blog' AND Rank > 0 order by Rank", function(err, rows, fields) {
			if (err) { 
				callback(err); 
				return;
			}
			Brow = rows;
			//console.log("in Blog")
			connection.release();
			callback();
		})
	})
}
function getEdu(db,callback) 
{
	db.getConnection(function(err,connection) 
		{
		//If err return the error and leave this place
		if (err) { 
			callback(err); 
			return;
		}
		connection.query("SELECT * from TopContent where Type = 'Edu'", function(err, rows, fields) {
			if (err) { 
				callback(err); 
				return;
			}
			Erow = rows;
			//console.log("in Edu")
			connection.release();
			callback();
		})
	})
}
function getArticles(db,callback) 
{
	db.getConnection(function(err,connection) 
	{
	//If err return the error and leave this place
	if (err) { 
		callback(err); 
		return;
	}
		connection.query("SELECT * from TopContent where Type = 'Stories'", function(err, rows, fields) {
			if (err) { 
				callback(err); 
				return;
			}
			Arow = rows;
			//console.log("in getArticles")
			connection.release();
			callback();
		})
	})
}


module.exports = router;
