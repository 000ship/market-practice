const express = require("express");
const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: false })); // x-www-form-urlencoded <form>
// app.use(bodyParser.json()); // apllication/json

// Allowing Front end apps from other severs
// app.use((req, res, next) => {
// 	res.setHeader("Access-Control-Allow-Origin", "*");
// 	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
// 	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
// 	next();
// });

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

// sequelize.sync({ force: true })
sequelize
	.sync()
	.then((result) => {
		app.listen(3000);
	})
	.catch((err) => console.log(err));
