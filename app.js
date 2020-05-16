const express = require("express");
const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const config = require("./config");
// const flash = require("connect-flash");

const Post = require("./models/post");
const User = require("./models/user");
const Product = require("./models/product");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const sitemap = require("express-sitemap")({
	sitemap: "public/sitemap.xml",
	url: "localhost",
	post: "3000",
});

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

// app.use(flash());
// View routes
const adminRoutes = require("./routes/admin");
const homeRoutes = require("./routes/home");
const paymentRoutes = require("./routes/payment");

// Api Routes
const apiPostRoutes = require("./routes/api/post");
const apiProductRoutes = require("./routes/api/product");
const apiCartRoutes = require("./routes/api/cart");
const apiAuthRoutes = require("./routes/api/auth");

// making public directory accesible for static fils like css, images, etc.
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// Using routes
app.use("/admin", adminRoutes);
app.use(homeRoutes);
app.use(paymentRoutes);

app.use(apiPostRoutes);
app.use(apiProductRoutes);
app.use(apiCartRoutes);
app.use("/auth", apiAuthRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500; // Default value will be 500
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

// Table Associations
Post.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Post);
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User, { onDelete: "CASCADE" });
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

// Generating sitemap
sitemap.generate4(app, ["/", "/auth"]);
sitemap.XMLtoFile();

// sequelize
// .sync({ force: true })
sequelize
	.sync()
	.then((result) => {
		app.listen(config.app.port);
	})
	.catch((err) => console.log(err));
