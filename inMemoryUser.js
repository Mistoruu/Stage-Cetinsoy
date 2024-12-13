const registeredUser = [
	{ email: "example@mail.com", password: "password", token: null },
	{ email: "example2@mail.com", password: "password2", token: null },
	{ email: "user1@mail.com", password: "mdp123", token: null },
];

function getRegisteredUser() {
	return registeredUser;
}

function checkCredidentials(email, password) {
	return registeredUser.find(
		(user) => user.email === email && user.password === password
	);
}

module.exports = {
	getRegisteredUser,
	checkCredidentials,
};
