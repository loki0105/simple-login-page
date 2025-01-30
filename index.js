import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
	})
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_NAME,
	password: process.env.PG_PASSWORD,
	port: process.env.PG_PORT,
});
db.connect();

app.get("/", async (req, res) => {
	res.render("index.ejs");
});

app.post("/submit", async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	console.log("login page", email, password);
	try {
		const result = await db.query("select * from users where username =$1", [
			email,
		]);
		if (result.rows.length == 0) {
			res.redirect("no username");
		} else {
			const hash = result.rows[0].password;
			bcrypt.compare(password, hash, function (err, result) {
				if (err) {
					console.log(err)
					
				} else {
					if (result) {
						res.render("congrats.ejs")
						
					} else
					{
						res.render("/");
						}
					
				}
				
			});
		}
	} catch (error) {
		console.log(error);
	}
});



app.get("/regpage", (req, res) => {
	res.render("reg.ejs");
});

//newemail newpassword newpascheck

app.post("/register", async (req, res) => {
	const email = req.body.newemail;
	const password = req.body.newpassword;
	const checkupp = req.body.newpascheck;
	console.log(email, password);
	if (password == checkupp) {
		try {
			const result = await db.query(
				"select  * from users where username = $1",
				[email]
			);
			if (result.rows.length !== 0) {
				console.log("email is used");
				req.redirect("/");
			} else {
				bcrypt.hash(password, saltRounds, async function (err, hash) {
					if (err) {
						console.log(err);
					} else {
						const cresult = await db.query(
							"insert into users (username, password) values ($1, $2) returning *",
							[email, hash]
						);
						console.log(cresult.rows);
						res.render("congrats.ejs");
					}
				});
			}
		} catch (error) {
			console.log(error);
		}
	}
});

app.get("/tryagain", (req, res) => {});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
