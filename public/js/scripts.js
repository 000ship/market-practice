$(function () {
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
		$.ajax({
			url: "http://localhost:3000/post",
			type: "post",
			data: $("#postForm").serialize(),
			success: function () {
				table.ajax.reload();
				console.log("added successfully!");
			},
		});
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
});
