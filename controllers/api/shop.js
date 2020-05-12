const User = require("../../models/user");
const Product = require("../../models/product");

exports.addToCart = async (req, res, next) => {
	try {
		const prodId = req.body.productId;
		let newQuantity = 1;
		const user = await User.findOne({ where: { id: req.userId } });

		if (!user) {
			const error = new Error("No User Found!");
			error.statusCode = 401;
			throw error;
		}
		let cart = await user.getCart();
		let products = await cart.getProducts({ where: { id: prodId } });
		let product;
		if (products.length > 0) {
			product = products[0];
		}
		if (product) {
			const oldQuantity = product.cartItem.quantity;
			newQuantity = oldQuantity + 1;
		}
		product = await Product.findByPk(prodId);
		const result = await cart.addProduct(product, { through: { quantity: newQuantity } });
		res.status(200).json(result);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
