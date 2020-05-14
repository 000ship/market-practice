const request = require("request-promise");
const User = require("../models/user");
const Order = require("../models/order");
const config = require("../config");

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
		const data = await payment("pay", user.email, total);
		// Saving payment information to database
		let orderOptions = {
			resNumber: data.Authority,
			paid: false,
			price: total,
		};

		const order = await user.createOrder(orderOptions);
		await order.addProducts(
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
		// Verifying the payment
		const data = await payment("check", "", order.price, req.query.Authority);
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

var payment = async function (type, email, total, Authority) {
	let params;
	let uri;
	if (type === "pay") {
		params = {
			MerchantID: config.payment.merchantID,
			Amount: total,
			CallbackURL: "http://localhost:3000/paymentChecker",
			Description: "For Buying Products",
			Email: email,
		};
		uri = "https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json";
	} else {
		params = {
			MerchantID: config.payment.merchantID,
			Amount: total,
			Authority: Authority,
		};
		uri = "https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json";
	}

	let options = {
		method: "POST",
		uri: uri,
		headers: {
			"cache-control": "no-cache",
			"content-type": "application/json",
		},
		body: params,
		json: true,
	};

	return await request(options);
};
