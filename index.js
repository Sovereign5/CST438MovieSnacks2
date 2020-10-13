const express = require("express");
// const mysql   = require("mysql");
const app = express();
const session = require('express-session');
var bodyParser = require('body-parser');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });


app.set("view engine", "ejs");
app.use(express.static("public")); //folder for img, css, js

//app.use(express.urlencoded()); //use to parse data sent using the POST method
app.use(session({ secret: 'any word', cookie: { maxAge: 1000 * 60 * 5 }}));
app.use(function(req, res, next) {
   res.locals.isAuthenticated = req.session.authenticated; 
   next();
});

app.get("/", async function(req, res){
    if (req.isAuthenticated) {
        console.log("AUTHENTICATED!");
    }
    res.render("home");
});//root

app.get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.send(JSON.stringify(results));
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

app.post("/addToTestTable", jsonParser, async function(req, res) {
	console.log(req.body.name);
	insertToDatabase(req.body.id, req.body.name);
	res.send(true);
});

// functions //
function insertToDatabase(id, name) {
	try {
		const client = pool.connect();
		return new Promise(function(resolve, reject) {
		let sql = 'INSERT INTO test_table (id, name) VALUES (?, ?)';
		let params = [id, name];
		client.query(sql, params, function(err, rows, fields) {
			if (err) throw err;
			client.end();
			resolve.rows();
			});
		});
	} catch (err) {

	}

}


//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});

var listener = app.listen(8888, function(){
    console.log('Listening on port ' + listener.address().port); //Listening on port 8888
});