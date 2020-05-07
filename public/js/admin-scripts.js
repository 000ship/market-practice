$(function () {
	var button = null;
	var validator = $("#postForm").validate();
	var form = $("#postForm")[0]; // this [0] Is super important (took about 3 days to figure out)
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
						});
					}
				},
			});
		} else {
			this.location.href = "/";
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
		var formData = new FormData(form);
		var saveBtn = $("#formPostBtn");
		if ($("#postForm").valid()) {
			saveBtn.attr("rel", "modal:close");
			if (button) {
				// edit
				$.ajax({
					url: "http://localhost:3000/post/" + button.attr("data-post-id"),
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
						console.log("Edited successfully!");
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
						console.log("added successfully!");
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
		$.ajax({
			url: "http://localhost:3000/post/" + button.attr("data-post-id"),
			method: "DELETE",
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
			},
			success: function () {
				table.row(button.parents("tr")).remove().draw();
				console.log("success");
			},
		});
	});

	//Open Modal for Editing a Post
	$("#postTable").on("click", "#editPost", function () {
		button = $(this);
		$.ajax({
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
			},
			url: "http://localhost:3000/post/" + button.attr("data-post-id"),
			success: function (data) {
				$("#post-title-input").val(data.title);
				$("#post-content-input").val(data.content);
				$("#post-imageUrl-input").val("");
				$("#post-imageUrl-input").removeAttr("required");
				$("#oldImage").val(data.imageUrl);
				$("#formPostBtn").text("Update");
				$("#formPostTitle").text("Edit");
			},
		});
		$("#open-post-modal").modal();
	});

	// Open Modal for adding new Post
	$("#open-post-modal").on("click", function (event) {
		event.preventDefault();
		button = null;
		validator.resetForm();
		$("#post-title-input").val("");
		$("#post-content-input").val("");
		$("#post-imageUrl-input").val("");
		$("#formPostBtn").text("Add Post");
		$("#formPostTitle").text("Insert");

		$("#open-post-modal").modal();
	});

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
				console.log("Updated successfully!");
				updateNavbar();
			},
		});
	});
});
