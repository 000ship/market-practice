const authMiddleware = require("../middleware/is-auth");
const expect = require("chai").expect;
const sinon = require("sinon");
const jwt = require("jsonwebtoken");

describe("-- Auth Middleware", function () {
	it("shoud returns an error, if Authorization header is not provided", function () {
		const req = {
			get: function () {
				return null;
			},
		};
		// bind(this ....) is for making sure we won't end up with auth middleware function itself
		// in another word, if it throws the error, we should see test passed.
		expect(authMiddleware.bind(this, req, {}, () => {})).to.throw("Not authenticated!");
	});

	it("shoud yield a userId after decoding the token", function () {
		const req = {
			get: function (headerName) {
				return "bearer fdsaffsgfagfdagarga";
			},
		};
		// sinon.stub => replace a part of code with our own version
		sinon.stub(jwt, "verify");
		jwt.verify.returns({ userId: 23 });
		authMiddleware(req, {}, () => {});
		expect(req).to.have.property("userId");
		// is it called at all !?
		expect(jwt.verify.called).to.be.true;
		// and after testing , restore its original
		jwt.verify.restore();
	});
});
