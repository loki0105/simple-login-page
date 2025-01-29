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





app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DATABASE,
	password: process.env.PG_PASSWORD,
	port: process.env.PG_PORT,
});
db.connect();



app.get("/", async (req, res) => {
const result = await db.query("select * from users");
console.log(result.rows);
	res.render("index.ejs", { loginFound: true });
});


app.post("/submit", (req, res) => {

});

app.post("/check", (req, res) => {

});



app.get("/register", (req, res) => {
	
});

app.get("/tryagain", (req, res) => {
	
});



app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
