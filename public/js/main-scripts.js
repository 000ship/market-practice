let userId = null;
$(function () {
	let isloggedin = false;

	// Update navbar profile pic & buttons if there's a logged in user
	if (localStorage.getItem("token")) {
		$.ajax({
			url: "https://localhost:3000/auth/getStatus",
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
			},
			success: function (data) {
				if (data.isValid) {
					$("#registerBtn").text("Logout");
					$("#registerBtn").removeAttr("href");
					$("#main-img-author").attr("src", data.imageUrl);
					$("#main-img-author-link").attr("href", "/admin");
					$("#cart-navbar").show();
					$("#order-navbar").show();
					isloggedin = true;
					userId = data.userId;
				}
			},
			error: function (error) {
				alertify.error("Please Login Again.");
				$("#cart-navbar").hide();
				$("#order-navbar").hide();
			},
		});
	} else {
		$("#cart-navbar").hide();
		$("#order-navbar").hide();
	}

	// Resize $ Change Background on Scroll
	$(document).scroll(function () {
		var $nav = $(".navbar-fixed-top");
		$nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
	});

	// Clicking on Login-in - Sign-up Button
	$("#registerBtn").on("click", function () {
		if (isloggedin) {
			// Log out
			localStorage.removeItem("token");
			location.href = "/";
		} else {
			login_validate.resetForm();
			signup_validate.resetForm();
			$("#loginForm")[0].trigger("reset");
			$("#signupForm")[0].trigger("reset");
		}
	});
});
