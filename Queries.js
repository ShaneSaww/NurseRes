var mysql  =require('mysql');
var PI = Math.PI;
var db = null;
var blog = "";

function blah(db, rows) 
{
	console.log("in function");


	console.log(rows);
}

exports.Brows = function(db, Brows) {
	db.query("SELECT * from TopContent where Type = 'Blog'", function(err, Brows, fields) {
	if (err) throw err;
	return Brows;
	});
	
	
};

exports.Prows = function(db, Pic) {
	db.query("SELECT * from TopContent where Type = 'Blog'", function(err, Pic, fields) {
	if (err) throw err;
	return Pic;
	});
};

exports.area = function (r) {
  return PI * r * r;
};