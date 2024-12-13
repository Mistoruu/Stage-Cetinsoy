const { v4: uuidv4 } = require("uuid");
const { getRegisteredUser, checkCredidentials } = require("./inMemoryUser");
const bcrypt = require("bcrypt");
const express = require("express");
const app = express();
const port = 3000;
const secured_urls = ["/", "/hello", "/restricted"];
let storedToken = "";
const authenticatedUsers = {};
//Middleware qui s'execute à chaque entrée
const registeredUsers = getRegisteredUser();
app.use((req, res, next) => {
	console.log(req.headers);
	next();
});
app.use(express.json());
// Middleware Parefeu
function firewall(req, res, next) {
	let url = req.path;
	if (secured_urls.includes(url) || req.headers["token"] === storedToken) {
		next();
	} else {
		if (req.headers["authorization"] != 42) {
			res.status(403).send("error 403: Unauthorized", storedToken);
		} else {
			next();
		}
	}
}
app.use(firewall);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.get("/hello", (req, res) => {
	res.send("<h1>Hello</h1>");
});

app.get("/restricted", (req, res) => {
	if (req.headers["token"] != storedToken) {
		res.status(403).send("error 403: Unauthorized");
	} else {
		res.json({
			message: "topsecret",
		});
	}
});

app.get("/restricted2", (req, res) => {
	if (req.headers["token"] != 42) {
		res.status(403).send("error 403: Unauthorized");
	} else {
		res.send("<h1>Admin Space</h1>");
	}
});

app.post("/authenticate", (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}
	const user = checkCredidentials(email, password);
	if (!user) {
		return res.status(403).json({ error: "Invalid email or password" });
	}
	const token = uuidv4();
	authenticatedUsers[token] = { email };
	res.json({ token });
});

function newUserRegistered(email, hashedPassword) {
	registeredUsers.push({ email, password: hashedPassword });
}
app.post("/register", async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}

	const userExists = registeredUsers.some((user) => user.email === email);

	if (userExists) {
		return res.status(400).json({ error: "User already registered" });
	}
	const hashedPassword = await bcrypt.hash(password, 10);
	newUserRegistered(email, hashedPassword);

	res.status(201).json({ message: "User registered successfully" });
	res.json({ user });
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
