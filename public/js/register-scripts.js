$(function () {
	// Resize $ Change Background on Scroll
	$(document).scroll(function () {
		var $nav = $(".navbar-fixed-top");
		$nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
	});

	////////////////////////////////////////
	///////////// REGISTER /////////////////
	////////////////////////////////////////
	// Forms Validation
	var login_validate = $("#loginForm").validate();
	var signup_validate = $("#signupForm").validate({
		rules: {
			password: {
				minlength: 6,
			},
			passwordRepeat: {
				equalTo: "#password",
			},
		},
	});
	var password_recovery_validate = $("#password-recovery-form").validate({
		rules: {
			password: {
				minlength: 6,
			},
			passwordRepeat: {
				equalTo: "#password",
			},
		},
	});

	// Signup New User
	$("#signupBtn").on("click", function (e) {
		e.preventDefault();
		var form = $("#signupForm")[0];
		var formData = new FormData(form);

		if ($("#signupForm").valid()) {
			$.ajax({
				url: "http://localhost:3000/auth/signup",
				type: "PUT",
				processData: false,
				contentType: false,
				data: formData,
				success: function (xhr) {
					alertify.success(xhr.message);
				},
				error: function (xhr) {
					const error = xhr.responseJSON.data[0];
					alertify.error(error.msg);
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
					localStorage.setItem("token", result.token);
					alertify.success(result.message);
					location.href = "/";
				},
				error: function (xhr) {
					const error = xhr.responseJSON;
					alertify.error(error.message);
				},
			});
		}
	});

	// Clicking on 'Send Confirmation Email' Button
	$("#email-modal-btn").on("click", function () {
		// alertify.error("Please enter your E-mail Address.");
		alertify.prompt(
			"Send Confirmation E-mail",
			"Please Enter Your E-mail Address.",
			"",
			function (event, value) {
				var data = new FormData();
				data.append("email", value);
				$.ajax({
					url: "http://localhost:3000/auth/sendConfirmEmail",
					type: "PUT",
					processData: false,
					contentType: false,
					data: data,
					success: function (xhr) {
						alertify.success(xhr.message);
					},
					error: function (xhr) {
						const error = xhr.responseJSON;
						alertify.error(error.message);
					},
				});
			},
			function (error) {
				alertify.error("cancelled.");
			}
		);
	});

	// Clicking on 'Forgot your password?' Button
	$("#password-modal-btn").on("click", function () {
		alertify.prompt(
			"Forgotten Password",
			"Please Enter Your E-mail Address.",
			"",
			function (event, value) {
				var data = new FormData();
				data.append("email", value);
				$.ajax({
					url: "http://localhost:3000/auth/sendPasswordEmail",
					type: "PUT",
					processData: false,
					contentType: false,
					data: data,
					success: function (xhr) {
						alertify.success(xhr.message);
					},
					error: function (xhr) {
						const error = xhr.responseJSON;
						alertify.error(error.message);
					},
				});
			},
			function (err) {
				alertify.error("Looks like you have remembered your password.");
			}
		);
	});

	// Recovery Password
	$("#passwordBtn").on("click", function (e) {
		e.preventDefault();
		var form = $("#password-recovery-form")[0];
		var formData = new FormData(form);

		if ($("#password-recovery-form").valid()) {
			$.ajax({
				url: "http://localhost:3000/auth/recoverPassword",
				type: "PUT",
				processData: false,
				contentType: false,
				data: formData,
				success: function (xhr) {
					alertify.success(xhr.message);
					location.href = "/registerForm";
				},
				error: function (xhr) {
					const error = xhr.responseJSON;
					alertify.error(error.message);
				},
			});
		}
	});
});
