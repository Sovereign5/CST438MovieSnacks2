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

const config = {
	database: 'dpudf0bnk9srb',
	host: 'ec2-34-234-185-150.compute-1.amazonaws.com',
	user: 'dlbibhjdnaskmf',
	password: '2bdda475bc7b897709f772b096527497173022a53ecec7ff9d929ef92c0b295a',
	port: '5432'
}
//heroku pg:psql postgresql-concentric-09360 --app cst438moviesnacks2

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.json());
app.use(express.urlencoded());

app.use(session({ secret: 'any word', cookie: { maxAge: 1000 * 60 * 5 }}));
app.use(function(req, res, next) {
   res.locals.isAuthenticated = req.session.authenticated; 
   next();
});


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

app.post("/addToTestTable", jsonParser, function(req, res) {
	console.log(req.body.name);
	insertToDatabase(req.body.id, req.body.name);
	res.send(true);
});

// functions //
async function insertToDatabase(id, name) {
	const client = await pool.connect()
	  // note: we don't try/catch this because if connecting throws an exception
	  // we don't need to dispose of the client (it will be undefined)
	  try {
		console.log(id + " " + name);
		let sql = 'INSERT INTO test_table (id, name) VALUES ($1, $2)';
		const params = [id, name];
		const test = await client.query(sql, params);
		await client.query('COMMIT');
	} catch (err) {
		await client.query('ROLLBACK');
		console.error(err);
		res.send("Error " + err);
		}
	}

function isAuthenticated(req, res, next){
    if(!req.session.authenticated) res.redirect('/login');
    else next();
}



//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});

var listener = app.listen(8888, function(){
    console.log('Listening on port ' + listener.address().port); //Listening on port 8888
});