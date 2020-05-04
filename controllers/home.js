exports.getIndex = (req, res, next) => {
	res.render("home/index");
};

exports.getRegistration = (req, res, next) => {
	res.render("home/registrationForm");
};
