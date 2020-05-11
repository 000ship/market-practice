const fs = require("fs");
const path = require("path");
const Product = require("../../models/product");
const User = require("../../models/user");
const { validationResult } = require("express-validator");

const ITEMS_PER_PAGE = 4;

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.findAll();
		res.status(200).json(products);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getProduct = async (req, res, next) => {
	try {
		const productId = req.params.productId;
		const product = await Product.findByPk(productId);
		if (!product) {
			const error = new Error("Could not find product.");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json(product);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.createProduct = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// Delete uploaded image incase of validation error
			clearImage("images/" + req.file.filename);
			const error = new Error("Validation failed; entered data is incorrect.");
			error.statusCode = 422;
			throw error;
		}

		if (!req.file) {
			const error = new Error("No image provided!");
			error.statusCode = 422;
			throw error;
		}

		const user = await User.findByPk(req.userId);

		if (!user) {
			const error = new Error("Could not find user.");
			error.statusCode = 404;
			throw error;
		}
		const result = await user.createProduct({
			title: req.body.title,
			imageUrl: "images/" + req.file.filename,
			content: req.body.content,
			price: req.body.price,
		});
		res.status(201).json({ message: "product created successfully", product: result });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deleteProduct = async (req, res, next) => {
	try {
		const productId = req.params.productId;
		const product = await Product.findByPk(productId);
		if (!product) {
			const error = new Error("Could not find product.");
			error.statusCode = 404;
			console.log(error);
			throw error;
		}
		// Check if the post is created by the logged in user or not
		if (product.userId !== req.userId) {
			console.log("you are not authorized!");
			const error = new Error("Not Authorized");
			error.statusCode = 404;
			throw error;
		}
		clearImage(product.imageUrl);
		await product.destroy();
		res.status(200).json({ message: "Success!" });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updateProduct = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// Delete uploaded image incase of validation error
			clearImage("images/" + req.file.filename);
			const error = new Error("Validation failed; entered data is incorrect.");
			error.statusCode = 422;
			throw error;
		}

		const productId = req.params.productId;
		const title = req.body.title;
		const content = req.body.content;
		const price = req.body.price;
		let imageUrl = req.body.oldImage;

		if (req.file) {
			imageUrl = "images/" + req.file.filename;
		}
		if (!imageUrl) {
			const error = new Error("No file pickd!");
			error.statusCode = 422;
			throw error;
		}

		const product = await Product.findByPk(productId);
		if (!product) {
			const error = new Error("Could not find post.");
			error.statusCode = 404;
			throw error;
		}
		// Check if the post is created by the logged in user or not
		if (product.userId !== req.userId) {
			const error = new Error("Not Authorized");
			error.statusCode = 404;
			throw error;
		}

		if (imageUrl !== product.imageUrl) {
			clearImage(product.imageUrl);
		}
		product.title = title;
		product.imageUrl = imageUrl;
		product.content = content;
		product.price = price;

		const result = await product.save();
		res.status(200).json({ message: "product Updated successfully", post: result });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getPaginatedProducts = async (req, res, next) => {
	try {
		const page = +req.query.page || 1;
		console.log("page ----" + req.query.page);
		let totalItems = await Product.count();
		const products = await Product.findAll({
			limit: ITEMS_PER_PAGE,
			offset: (page - 1) * ITEMS_PER_PAGE,
		});
		console.log("current page ------" + page);
		res.status(200).json({
			products: products,
			currentPage: page,
			hasNextPage: ITEMS_PER_PAGE * page < totalItems,
			hasPreviousPage: page > 1,
			nextPage: page + 1,
			previousPage: page - 1,
			lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

// Deleting image when deleting product or editing
const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", "..", filePath);
	fs.unlink(filePath, (err) => console.log(err));
};
