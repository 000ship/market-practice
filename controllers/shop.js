const path = require("path");

exports.getIndex = (req, res, next) => {
	res.sendFile(path.join(__dirname, "../", "views", "shop", "index.html"));
};
