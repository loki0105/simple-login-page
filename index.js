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


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
	})
);

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_NAME,
	password: process.env.PG_PASSWORD,
	port: process.env.PG_PORT,
});
db.connect();

app.get("/", (req, res) => {

	res.render("index.ejs");
});

app.get("/reggg1", (req, res) => {
	res.render("reg.ejs");
});

app.get("/logout", (req, res) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
});

app.get("/success", (req, res) => {
	console.log(req.user);
	if (req.isAuthenticated()) {
		res.render("congrats.ejs");
	} else {
		res.redirect("/");
	}
});

app.post(
	"/submit",
	passport.authenticate("local", {
		successRedirect: "/success",
		failureRedirect: "/",
	})
);

app.get("/regpage", (req, res) => {
	res.render("congrats.ejs");
});


//newemail newpassword newpascheck
//add@ss add
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
						res.redirect("/regpage");
					}
				});
			}
		} catch (err) {
			console.log(err);
		}
	}
});

passport.use(
	new Strategy(async function verify(username, password, cb) {
		try {
			
			const result = await db.query("select * from users where username =$1", [
				username,
			]);
			if (result.rows.length > 0) {
				const user = result.rows[0];
				const storedHashedPassword = user.password;
				bcrypt.compare(password, storedHashedPassword, (err, valid) => {
					if (err) {
						return cb(err);
					} else {
						if (valid) {
							return cb(null, user);
						} else {
							return cb(null, false);
						}
					}
				});
			} else {
				return cb("User not found");
			}
		} catch (err) {
			console.log(err);
		}
	})
);

passport.serializeUser((user, cb) => {
	cb(null, user);
});
passport.deserializeUser((user, cb) => {
	cb(null, user);
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
