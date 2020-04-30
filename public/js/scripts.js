$(function () {
	var button = null;
	// Resize $ Change Background on Scroll
	$(document).scroll(function () {
		var $nav = $(".navbar-fixed-top");
		$nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
	});

	// Populating Table
	var table = $("#postTable").DataTable({
		ajax: {
			url: "http://localhost:3000/posts",
			dataSrc: "",
		},
		columns: [
			{
				data: "id",
			},
			{
				data: "title",
			},
			{
				data: "imageUrl",
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

	// Add new Post
	$("#formPostBtn").on("click", function (e) {
		e.preventDefault();
		if (button) {
			// edit
			$.ajax({
				url: "http://localhost:3000/post/" + button.attr("data-post-id"),
				method: "PUT",
				data: $("#postForm").serialize(),
				success: function () {
					table.ajax.reload();
					console.log("edited successfully!");
				},
			});
		} else {
			// add
			$.ajax({
				url: "http://localhost:3000/post",
				type: "post",
				data: $("#postForm").serialize(),
				success: function () {
					table.ajax.reload();
					console.log("added successfully!");
				},
			});
		}
	});

	//Deleting a post
	$("#postTable").on("click", "#deletePost", function () {
		var button = $(this);
		$.ajax({
			url: "http://localhost:3000/post/" + button.attr("data-post-id"),
			method: "DELETE",
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
			url: "http://localhost:3000/post/" + button.attr("data-post-id"),
			success: function (data) {
				$("#post-title-input").val(data.title);
				$("#post-imageUrl-input").val(data.imageUrl);
				$("#post-content-input").val(data.content);
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
		$("#post-title-input").val("");
		$("#post-imageUrl-input").val("");
		$("#post-content-input").val("");
		$("#formPostBtn").text("Add Post");
		$("#formPostTitle").text("Insert");

		$("#open-post-modal").modal();
	});
});
