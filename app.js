const express = require("express");
const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const app = express();

// multer
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "images");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use(bodyParser.urlencoded({ extended: false })); // x-www-form-urlencoded <form>
// app.use(bodyParser.json()); // apllication/json
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));

// Usings EJS view engine, and telling it to look for views in views directory
app.set("view engine", "ejs");
app.set("views", "views");

// View routes
const adminRoutes = require("./routes/admin");

// Api Routes
const apiPostRoutes = require("./routes/api/post");

// making public directory accesible for static fils like css, images, etc.
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// Using routes
app.use("/admin", adminRoutes);
app.use(apiPostRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500; // Default value will be 500
	const message = error.message;
	res.status(status).json({ message: message });
});

// sequelize.sync({ force: true })
sequelize
	.sync()
	.then((result) => {
		app.listen(3000);
	})
	.catch((err) => console.log(err));
