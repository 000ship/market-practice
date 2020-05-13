$(function () {
	var postButton = null;
	var productButton = null;
	var postValidator = $("#postForm").validate();
	var productValidator = $("#productForm").validate();
	var postForm = $("#postForm")[0]; // this [0] Is super important (took about 3 days to figure out)
	var productForm = $("#productForm")[0]; // this [0] Is super important (took about 3 days to figure out)
	let userId = null;
	updateNavbar();

	// Update navbar profile pic & Text
	function updateNavbar() {
		if (localStorage.getItem("token")) {
			$.ajax({
				url: "http://localhost:3000/auth/getStatus",
				headers: {
					Authorization: "bearer " + localStorage.getItem("token"),
				},
				success: function (data) {
					if (data.isValid) {
						userId = data.userId;
						$("#admin-img-author").attr("src", "../../../" + data.imageUrl);
						if (data.name) {
							$("#memberName").text(data.name);
						}
						// populate user info form
						$.ajax({
							url: "http://localhost:3000/auth/getUserInfo/" + userId,
							headers: {
								Authorization: "bearer " + localStorage.getItem("token"),
							},
							success: function (data) {
								$("#user-email-input").text(data.email);
								$("#user-name-input").val(data.name);
								$("#user-imageUrl-input").val("");
							},
							error: function (error) {
								alertify.error("Please Login again.");
							},
						});
					}
				},
				error: function () {
					alertify.error("Please Login again.");
					location.href = "/";
				},
			});
		} else {
			location.href = "/";
		}
	}

	////////////////////////////////////////
	///////////// POST /////////////////////
	////////////////////////////////////////
	// Populating Table
	var table = $("#postTable").DataTable({
		ajax: {
			url: "http://localhost:3000/posts",
			dataSrc: "",
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
			},
		},
		columns: [
			{
				data: "id",
			},
			{
				data: "imageUrl",
				render: function (data) {
					return (
						"<img class='img-rounded img-responsive' src='" +
						"http://localhost:3000/" +
						data +
						"'/>"
					);
				},
			},
			{
				data: "title",
			},
			{
				data: "content",
			},
			{
				data: "id",
				render: function (data) {
					return (
						"<button class='btn btn-default' id='editPost' data-post-id=" + data + ">Edit</button>"
					);
				},
			},
			{
				data: "id",
				render: function (data) {
					return (
						"<button class='btn btn-danger' id='deletePost' data-post-id=" +
						data +
						">Delete</button>"
					);
				},
			},
		],
	});

	// Add new Post or Edit Existing Post
	$("#formPostBtn").on("click", function (e) {
		e.preventDefault();
		var formData = new FormData(postForm);
		var saveBtn = $("#formPostBtn");
		if ($("#postForm").valid()) {
			saveBtn.attr("rel", "modal:close");
			if (postButton) {
				// edit
				$.ajax({
					url: "http://localhost:3000/post/" + postButton.attr("data-post-id"),
					type: "put",
					headers: {
						Authorization: "bearer " + localStorage.getItem("token"),
					},
					enctype: "multipart/form-data",
					contentType: false,
					processData: false, //important
					cache: false,
					data: formData,
					// data: new FormData(form),
					success: function () {
						table.ajax.reload();
						alertify.success("Post Updated Successfully");
					},
					error: function (xhr) {
						const error = xhr.responseJSON;
						alertify.error(error.message);
					},
				});
			} else {
				// add
				$.ajax({
					url: "http://localhost:3000/post",
					type: "post",
					headers: {
						Authorization: "bearer " + localStorage.getItem("token"),
					},
					enctype: "multipart/form-data",
					contentType: false,
					processData: false, //important
					cache: false,
					data: formData,
					// data: new FormData(form),
					success: function () {
						table.ajax.reload();
						alertify.success("Post Added Successfully.");
					},
					error: function (xhr) {
						const error = xhr.responseJSON;
						alertify.error(error.message);
					},
				});
			}
		} else {
			saveBtn.removeAttr("rel");
		}
	});

	//Deleting a post
	$("#postTable").on("click", "#deletePost", function () {
		var button = $(this);
		alertify.confirm("Are you sure, you want to delete this post?", function () {
			$.ajax({
				url: "http://localhost:3000/post/" + button.attr("data-post-id"),
				method: "DELETE",
				headers: {
					Authorization: "bearer " + localStorage.getItem("token"),
				},
				success: function () {
					table.row(button.parents("tr")).remove().draw();
					alertify.success("Post Deleted Successfully.");
				},
				error: function (xhr) {
					const error = xhr.responseJSON;
					alertify.error(error.message);
				},
			});
		});
	});

	//Open Modal for Editing a Post
	$("#postTable").on("click", "#editPost", function () {
		postButton = $(this);
		$.ajax({
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
			},
			url: "http://localhost:3000/post/" + postButton.attr("data-post-id"),
			success: function (data) {
				$("#post-title-input").val(data.title);
				$("#post-content-input").val(data.content);
				$("#post-imageUrl-input").val("");
				$("#post-imageUrl-input").removeAttr("required");
				$("#oldImage").val(data.imageUrl);
				$("#formPostBtn").text("Update");
				$("#formPostTitle").text("Edit");
			},
			error: function (xhr) {
				const error = xhr.responseJSON;
				alertify.error(error.message);
			},
		});
		$("#open-post-modal").modal();
	});

	// Open Modal for adding new Post
	$("#open-post-modal").on("click", function (event) {
		event.preventDefault();
		postButton = null;
		postValidator.resetForm();
		$("#post-title-input").val("");
		$("#post-content-input").val("");
		$("#post-imageUrl-input").val("");
		$("#formPostBtn").text("Add Post");
		$("#formPostTitle").text("Insert");

		$("#open-post-modal").modal();
	});

	/////////////////////////////////////////
	///////////// PRODUCT //////////////////
	///////////////////////////////////////

	// Populating Product Table
	var productTable = $("#productTable").DataTable({
		ajax: {
			url: "http://localhost:3000/products",
			dataSrc: "",
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
			},
		},
		columns: [
			{
				data: "id",
			},
			{
				data: "imageUrl",
				render: function (data) {
					return (
						"<img class='img-rounded img-responsive' src='" +
						"http://localhost:3000/" +
						data +
						"'/>"
					);
				},
			},
			{
				data: "title",
			},
			{
				data: "content",
			},
			{
				data: "price",
			},
			{
				data: "id",
				render: function (data) {
					return (
						"<button class='btn btn-default' id='editProduct' data-product-id=" +
						data +
						">Edit</button>"
					);
				},
			},
			{
				data: "id",
				render: function (data) {
					return (
						"<button class='btn btn-danger' id='deleteProduct' data-product-id=" +
						data +
						">Delete</button>"
					);
				},
			},
		],
	});

	// Open Modal for adding new Product
	$("#open-product-modal").on("click", function (event) {
		event.preventDefault();
		productButton = null;
		productValidator.resetForm();
		$("#product-title-input").val("");
		$("#product-content-input").val("");
		$("#product-imageUrl-input").val("");
		$("#product-price-input").val("");
		$("#formProductBtn").text("Add Product");
		$("#formProductTitle").text("Insert");

		$("#open-product-modal").modal();
	});

	//Open Modal for Editing a Product
	$("#productTable").on("click", "#editProduct", function () {
		productButton = $(this);
		$.ajax({
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
			},
			url: "http://localhost:3000/product/" + productButton.attr("data-product-id"),
			success: function (data) {
				$("#product-title-input").val(data.title);
				$("#product-content-input").val(data.content);
				$("#product-price-input").val(data.price);
				$("#product-imageUrl-input").val("");
				$("#product-imageUrl-input").removeAttr("required");
				$("#oldImage").val(data.imageUrl);
				$("#formProductBtn").text("Update");
				$("#formProductTitle").text("Edit");
			},
			error: function (xhr) {
				const error = xhr.responseJSON;
				alertify.error(error.message);
			},
		});
		$("#open-product-modal").modal();
	});

	// Add new Post or Edit Existing Product
	$("#formProductBtn").on("click", function (e) {
		e.preventDefault();
		var formData = new FormData(productForm);
		var saveBtn = $("#formProductBtn");
		if ($("#productForm").valid()) {
			saveBtn.attr("rel", "modal:close");
			if (productButton) {
				// edit
				$.ajax({
					url: "http://localhost:3000/product/" + productButton.attr("data-product-id"),
					type: "put",
					headers: {
						Authorization: "bearer " + localStorage.getItem("token"),
					},
					enctype: "multipart/form-data",
					contentType: false,
					processData: false, //important
					cache: false,
					data: formData,
					// data: new FormData(form),
					success: function (xhr) {
						productTable.ajax.reload();
						alertify.success(xhr.message);
					},
					error: function (xhr) {
						const error = xhr.responseJSON;
						alertify.error(error.message);
					},
				});
			} else {
				// add
				$.ajax({
					url: "http://localhost:3000/product",
					type: "post",
					headers: {
						Authorization: "bearer " + localStorage.getItem("token"),
					},
					enctype: "multipart/form-data",
					contentType: false,
					processData: false, //important
					cache: false,
					data: formData,
					// data: new FormData(form),
					success: function (xhr) {
						productTable.ajax.reload();
						alertify.success(xhr.message);
					},
					error: function (xhr) {
						const error = xhr.responseJSON;
						alertify.error(error.message);
					},
				});
			}
		} else {
			saveBtn.removeAttr("rel");
		}
	});

	//Deleting a Product
	$("#productTable").on("click", "#deleteProduct", function () {
		var button = $(this);
		alertify.confirm("Are you sure, you want to delete this Product?", function () {
			$.ajax({
				url: "http://localhost:3000/product/" + button.attr("data-product-id"),
				method: "DELETE",
				headers: {
					Authorization: "bearer " + localStorage.getItem("token"),
				},
				success: function (xhr) {
					productTable.row(button.parents("tr")).remove().draw();
					alertify.success(xhr.message);
				},
				error: function (xhr) {
					const error = xhr.responseJSON;
					alertify.error(error.message);
				},
			});
		});
	});
	///////////////////////////////////////
	///////////////////////////////////////
	///////////////////////////////////////

	// Exit Button (Logout)
	$("#admin-logout").on("click", function () {
		localStorage.removeItem("token");
		location.href = "/";
	});

	// Updating User Info
	$("#user-info-update").on("click", function () {
		var formData = new FormData($("#user-info-form")[0]);
		console.log(formData);
		$.ajax({
			url: "http://localhost:3000/auth/updateUserInfo/" + userId,
			type: "put",
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
			},
			contentType: false,
			processData: false, //important
			cache: false,
			data: formData,
			success: function () {
				alertify.success("User Info updated Successfully.");
				updateNavbar();
			},
			error: function (xhr) {
				const error = xhr.responseJSON;
				alertify.error(error.message);
			},
		});
	});

	// Clicking on Change Password in Admin Panel
	$("#admin-change-password").on("click", function () {
		alertify.prompt(
			"Change Password",
			"Please Enter Your New Password.",
			"",
			function (event, value) {
				var data = new FormData();
				data.append("id", userId);
				data.append("password", value);
				$.ajax({
					url: "http://localhost:3000/auth/recoverPassword",
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
});
