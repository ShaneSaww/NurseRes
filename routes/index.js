var express = require('express');
var router = express.Router();
var async = require('async');
/* GET home page. */
router.get('/', function(req, res) {
	var db = req.db;
	//var T = req.T;
	//db.connect();
	//We will use async parallel to keep performance up. 
	//What this is going to do is call each one of the functions, and then wait for them all to return
	//once they all return we will do the last part of the async which will be to render the webpage. 
	//mysql should be able to withstand the heat. 
	async.parallel([
	function(callback) {
		query = "SELECT * FROM TopContent Where Type = 'Blog' and isDisplayed = 'YES' ORDER BY isDisplayed DESC, Rank";
		getBlog(db,query,callback);
	},	
	function(callback) {
		query = "SELECT * FROM TopContent Where Type = 'Pic' and isDisplayed = 'YES' ORDER BY isDisplayed DESC, Rank";
		getPic(db,query,callback);
	},
	function(callback) {
		query = "SELECT * FROM TopContent Where Type = 'Edu' and isDisplayed = 'YES' ORDER BY isDisplayed DESC, Rank";
		getEdu(db,query,callback);
	},
		function(callback) {
		query = "SELECT * FROM TopContent Where Type = 'Stories' and isDisplayed = 'YES' ORDER BY isDisplayed DESC, Rank";
		getArticles(db,query,callback);
	},
		function(callback) {
			//T.get('favorites/list', { screen_name: 'NurseGrid', count: 1 }, function(err, data, response) {
			//console.log(data);
			//tweet = data;
			callback();
			//});
			
	}
	], function(err) {
		if(err) {
			throw err;
		}
		
		res.render('index',	
		{
			Brows : Brows,
			Prow : Prow,
			Arow : Arow,
			Erow : Erow//,
			//Tweet : tweet
		});
	});
	//db.end();
});


/* Get DB Page */
router.get('/em', function(req,res) {
	var db = req.db;
		//db.connect();
		//We will use async parallel to keep performance up. 
		//What this is going to do is call each one of the functions, and then wait for them all to return
		//once they all return we will do the last part of the async which will be to render the webpage. 
		//mysql should be able to withstand the heat. 
		async.parallel([
		function(callback) {
			query = "SELECT * FROM TopContent Where Type = 'Blog'  ORDER BY isDisplayed DESC, Rank";
			getBlog(db,query,callback);
		},	
		function(callback) {
			query = "SELECT * FROM TopContent Where Type = 'Pic'  ORDER BY isDisplayed DESC, Rank";
			getPic(db,query,callback);
		},
			function(callback) {
			query = "SELECT * FROM TopContent Where Type = 'Edu'  ORDER BY isDisplayed DESC, Rank";
			getEdu(db,query,callback);
		},
			function(callback) {
			query = "SELECT * FROM TopContent Where Type = 'Stories'  ORDER BY isDisplayed DESC, Rank";
			getArticles(db,query,callback);
		}
		], function(err) {
			if(err) {
				throw err;
			}
			
			res.render('em',	
			{
				Brows : Brows,
				Prow : Prow,
				Arow : Arow,
				Erow : Erow
			});
		});
	
});
/* ###############
	Creating the Edit and Add Pages'
	First comes the add page
	Then the edit pages
#####################*/
//get the add pages inside of edit mode(em)
router.get('/em/add', function(req,res) {
	res.render('add_link', {});
});
//Read the input for the add page, then create the row//
router.post('/em/add', function(req,res) {
	//Get the database pool
	var db = req.db;
	//console.log("in post");
	//console.log(req.body);
	// read the request and the body of it.
	// Turn it into JSON and parse it so I can send it back into the database.
	var input = JSON.parse(JSON.stringify(req.body));
	//console.log(input);
	//Connect to the poool then check for errors.
	db.getConnection(function(err,connection) 
	{
		if (err) { 
			callback(err); 
			return;
		}
		//Transform the data into json format fully, and prep it for sending,
		var data = {
			Link : input.Link,
			DisplayLink : input.DisplayLink,
			Description : input.Description,
			Type : input.Type,
			isDisplayed : input.isDisplayed,
			Rank : input.Rank,
			PicLink : input.PicLink 
		};
		//Create the query, notice how the ? is a variable that will be created at run time
		var query = connection.query("Insert into TopContent set ? " ,data,function(err,rows)
		{
			if(err)
			{
				console.log("Error Insert: %s ", err);
			};
			// after all of this send them back to the homepage.
			// In the future make this a success page, and send the rows back to them. 
			connection.release();
			res.redirect('/em');
		});
		
		//Display the query. 
		//console.log(query.sql);
	});
});

//Create the editing pages.
router.get('/em/edit/:PK',function(req,res) {
	//Get the database pool
	var db = req.db;
	// read the request and the body of it.
	// Turn it into JSON and parse it so I can send it back into the database.
	var input = JSON.parse(JSON.stringify(req.body));
	var PK = req.params.PK;
	//POOOOL
	db.getConnection(function(err,connection) 
	{
		if (err) { 
			callback(err); 
			return;
		}
		var query = connection.query('SELECT * FROM  TopContent Where Id = ?',PK,function(err,row)
        {
			if(err){
                console.log("Error Selecting : %s ",err );
			};
			connection.release();
            res.render('edit_link',
			{
				row : row
			});
		});
		
	});
});
//Read the edited line and do the DB insert
//Read the input for the add page, then create the row//
router.post('/em/edit/:PK', function(req,res) {
	//Get the database pool
	var db = req.db;
	var PK = req.params.PK;
	//console.log("in post");
	//console.log(req.body);
	// read the request and the body of it.
	// Turn it into JSON and parse it so I can send it back into the database.
	var input = JSON.parse(JSON.stringify(req.body));
	//console.log(input);
	//Connect to the poool then check for errors.
	db.getConnection(function(err,connection) 
	{
		if (err) { 
			callback(err); 
			return;
		}
		if (!input.isDisplayed) { input.isDisplayed = "No"; }
		else {  input.isDisplayed = "Yes";}
		//Transform the data into json format fully, and prep it for sending,
			var data = {
				Link : input.Link,
				DisplayLink : input.DisplayLink,
				Description : input.Description,
				Type : input.Type,
				isDisplayed : input.isDisplayed,
				Rank : input.Rank,
				PicLink : input.PicLink 
			};
		
		//Create the query, notice how the ? is a variable that will be created at run time
		var query = connection.query("Update TopContent set ? where Id = ?  " ,[data,PK],function(err,rows)
		{
			if(err)
			{
				console.log("Error Insert: %s ", err);
			};
			// after all of this send them back to the homepage.
			// In the future make this a success page, and send the rows back to them. 
			connection.release();
			res.redirect('/em');
			//Display the query. 
			});
		
	});
});

router.get('/em/delete/:PK', function (req,res) {
	var db = req.db;
	var PK = req.params.PK;
	db.getConnection(function(err,connection) 
		{
			if (err) { 
				callback(err); 
				return;
			}
		connection.query("DELETE FROM  TopContent where Id = ? ", [PK], function(err,rows)
			{
				if(err) {console.log("Error deleting : %s ", err);}
				connection.release();
				res.redirect('/em');
			});
		});
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

function getPic(db,query,callback) 
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
		connection.query(query, function(err, rows, fields) {
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

function getBlog(db,query,callback) 
{
	
	db.getConnection(function(err,connection) 
	{
		//If err return the error and leave this place
		if (err) { 
			callback(err); 
			return;
		}
		connection.query(query, function(err, rows, fields) {
			if (err) { 
				callback(err); 
				return;
			}
			Brows = rows;
			connection.release();
			callback();
		})
	})
}
function getEdu(db,query,callback)
{
	db.getConnection(function(err,connection) 
		{
		//If err return the error and leave this place
		if (err) { 
		console.log(err);
			callback(err); 
			return;
		}
		connection.query(query, function(err, rows, fields) {
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
function getArticles(db,query,callback) 
{
	db.getConnection(function(err,connection) 
	{
	//If err return the error and leave this place
	if (err) { 
		callback(err); 
		return;
	}
		connection.query(query, function(err, rows, fields) {
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
