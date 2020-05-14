const config = require("../config");
var https = require("https");

module.exports = async (req, res, next) => {
	const response = req.body["g-recaptcha-response"];
	if (!response) {
		const error = new Error("No Recaptcha!");
		error.statusCode = 401;
		throw error;
	}
	https.get(
		"https://www.google.com/recaptcha/api/siteverify?secret=" +
			config.recaptcha.secretKey +
			"&response=" +
			response,
		function (res) {
			var data = "";
			res.on("data", function (chunk) {
				data += chunk.toString();
			});
			res.on("end", function () {
				try {
					var parsedData = JSON.parse(data);
					console.log(parsedData);
					next();
				} catch (err) {
					if (!err.statusCode) {
						err.statusCode = 500;
					}
					next(err);
				}
			});
		}
	);
};
