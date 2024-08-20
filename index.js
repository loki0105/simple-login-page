import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.render("index.ejs", { loginFound: true });
});

app.post("/submit", (req, res) => {
	const login = req.body["email"];
	const password = req.body["password"];

	const intdat = readRawDataFromFile("database.json");


	let loginFound = false;

	for (let index = 0; index < intdat.length; index++) {
		if (intdat[index][0] === login && intdat[index][1] === password) {
			loginFound = true;
			break;
		} else {
			loginFound = false;
		}
	}

	if (loginFound) {
    res.render("congrats.ejs");
    
	} else {
    res.render("index.ejs", { loginFound });
    
	}
});

app.post("/check", (req, res) => {
	const newlogin = req.body["newemail"];
	const newpassword = req.body["newpassword"];
	const newpascheck = req.body["newpascheck"];

	if (newpassword === newpascheck) {
		// Read the existing data from the file
		fs.readFile("database.json", "utf8", function readFileCallback(err, data) {
			if (err) {
				console.error("Error reading the file:", err);
				res.render("err.ejs");
			} else {
				let intdat;

				// Check if the file is empty or not in JSON format
				if (data.trim() === "") {
					intdat = []; // Start with an empty array if the file is empty
				} else {
					intdat = JSON.parse(data); // Parse the existing data
				}

				// Append the new login and password as an array
				intdat.push([newlogin, newpassword]);

				// Convert the updated array back to a JSON string
				const json = JSON.stringify(intdat, null, 2); // Pretty-print JSON with 2-space indentation

				// Write the updated JSON string back to the file
				fs.writeFile("database.json", json, "utf8", (err) => {
					if (err) {
						console.error("Error writing to the file:", err);
						res.render("err.ejs");
					} else {
						console.log("The login data has been saved!");
						res.render("index.ejs", { loginFound: true });
					}
				});
			}
		});
	} else {
		 res.render("reg.ejs", { loginFound:false });
	}
});



app.get("/register", (req, res) => {
	res.render("reg.ejs", { loginFound: false });
});

app.get("/tryagain", (req, res) => {
	res.render("index.ejs");
});

function readRawDataFromFile(filePath) {
	try {
		// Read the content of the file
		const data = fs.readFileSync(filePath, "utf8");

		// Parse the JSON data into an array
		const parsedData = JSON.parse(data);

		// Return the parsed data
		return parsedData;
	} catch (err) {
		console.error("Error reading or parsing the file:", err);
		return null; // Return null if there's an error
	}
}

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
