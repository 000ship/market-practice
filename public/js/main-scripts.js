$(function () {
	var login_validate = $("#loginForm").validate();
	var signup_validate = $("#signupForm").validate({
		rules: {
			password: {
				minlength: 5,
			},
			passwordRepeat: {
				equalTo: "#password",
			},
		},
	});
	// Resize $ Change Background on Scroll
	$(document).scroll(function () {
		var $nav = $(".navbar-fixed-top");
		$nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
	});

	////////////////////////////////////////
	///////////// REGISTER /////////////////
	////////////////////////////////////////

	// Signup New User
	$("#signupBtn").on("click", function (e) {
		e.preventDefault();
		var form = $("#signupForm")[0];
		var formData = new FormData(form);

		if ($("#signupForm").valid()) {
			console.log("it is valid!");
			$.ajax({
				url: "http://localhost:3000/auth/signup",
				type: "PUT",
				processData: false,
				contentType: false,
				data: formData,
				success: function (result) {
					console.log(result);
				},
			});
		}
	});

	// Login User
	$("#loginBtn").on("click", function (e) {
		e.preventDefault();
		var form = $("#loginForm")[0];
		var formData = new FormData(form);
		if ($("#loginForm").valid()) {
			$.ajax({
				url: "http://localhost:3000/auth/login",
				type: "POST",
				processData: false,
				contentType: false,
				data: formData,
				success: function (result) {
					console.log(result);
					localStorage.setItem("token", result.token);
					$("#registerBtn").text("Logout");
					$("#main-img-author").attr("src", "images/author.jpg");
					$("#admin-img-author").attr("src", "../../../images/author.jpg");
					location.href = "/";
				},
			});
		}
	});

	// Clicking on Login-in - Sign-up Button
	$("#registerBtn").on("click", function () {
		login_validate.resetForm();
		signup_validate.resetForm();
		$("#loginForm")[0].trigger("reset");
		$("#signupForm")[0].trigger("reset");
	});
});
