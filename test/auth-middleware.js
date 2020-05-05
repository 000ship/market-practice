const authMiddleware = require("../middleware/is-auth");
const expect = require("chai").expect;

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
