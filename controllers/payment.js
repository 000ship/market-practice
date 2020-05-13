const request = require("request-promise");
const User = require("../models/user");
const Order = require("../models/order");

// Redirecting to Zarrinpal checkout
exports.checkout = async (req, res, next) => {
	try {
		// Constants
		const user = await User.findOne({ where: { id: req.body.userId } });
		const cart = await user.getCart({ include: ["products"] });
		let total = 0;
		const products = await cart.products;
		// Calculating the total
		products.forEach((p) => {
			total += p.cartItem.quantity * p.price;
		});

		// Sending Request to Zarinpal gateway
		let params = {
			MerchantID: "6a69819e-1183-11e9-be50-005056a205be",
			Amount: total,
			CallbackURL: "http://localhost:3000/paymentChecker",
			Description: "For Buying Products",
			Email: user.email,
		};

		let options = {
			method: "POST",
			uri: "https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json",
			headers: {
				"cache-control": "no-cache",
				"content-type": "application/json",
			},
			body: params,
			json: true,
		};

		const data = await request(options);
		// Saving payment information to database
		let orderOptions = {
			resNumber: data.Authority,
			paid: false,
			price: total,
		};

		const order = await user.createOrder(orderOptions);
		const result = await order.addProducts(
			products.map((product) => {
				product.orderItem = { quantity: product.cartItem.quantity };
				return product;
			})
		);
		cart.setProducts(null);
		res.redirect(`https://www.zarinpal.com/pg/StartPay/${data.Authority}`);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

// Validating the payment
exports.paymentChecker = async (req, res, next) => {
	try {
		const order = await Order.findOne({ where: { resNumber: req.query.Authority } });
		if (!order) {
			return res.render("home/orders", {
				errorMessage: "No Order Found!",
				type: "error",
			});
		}

		let params = {
			MerchantID: "6a69819e-1183-11e9-be50-005056a205be",
			Amount: order.price,
			Authority: req.query.Authority,
		};

		let options = {
			method: "POST",
			uri: "https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json",
			headers: {
				"cache-control": "no-cache",
				"content-type": "application/json",
			},
			body: params,
			json: true,
		};

		const data = await request(options);
		if (data.Status == 100) {
			order.paid = true;
			order.save();
			return res.render("home/orders", {
				errorMessage: "Payment was Successful!",
				type: "success",
			});
		} else {
			return res.render("home/orders", {
				errorMessage: "Payment was not Successful!",
				type: "error",
			});
		}
	} catch (err) {
		res.render("home/orders", {
			errorMessage: "Payment was Unsuccessful!",
			type: "error",
		});
	}
};

var payment = function () {};
