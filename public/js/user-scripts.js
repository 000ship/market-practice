$(function () {
	// var postButton = null;
	// var productButton = null;
	// var postValidator = $("#postForm").validate();
	// var productValidator = $("#productForm").validate();
	// var postForm = $("#postForm")[0]; // this [0] Is super important (took about 3 days to figure out)
	// var productForm = $("#productForm")[0]; // this [0] Is super important (took about 3 days to figure out)
	// let userId = null;
	var token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

	// Populating Table
	var table = $("#userTable").DataTable({
		ajax: {
			url: "https://localhost:3000/users",
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
						"<img class='img-circle img-responsive img-author' src='" +
						"https://localhost:3000/" +
						data +
						"'/>"
					);
				},
			},
			{
				data: "name",
			},
			{
				data: "role",
			},
			{
				data: "email",
			},
			{
				data: "id",
				render: function (data, type, row) {
					var status = row.status == true ? "checked" : null;
					if (status) {
						return "<input id='changeStatus' data-user-id=" + data + " type='checkbox' checked>";
					} else {
						return "<input id='changeStatus' data-user-id=" + data + " type='checkbox' >";
					}
				},
			},
		],
	});

	// Change User Status
	$("#userTable").on("change", "#changeStatus", function (e) {
		e.preventDefault();
		checkbox = $(this);
		var data = new FormData();
		data.append("status", checkbox.is(":checked") ? true : false);
		$.ajax({
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
				"CSRF-Token": token,
			},
			url: "https://localhost:3000/userStatus/" + checkbox.attr("data-user-id"),
			type: "put",
			contentType: false,
			processData: false,
			data: data,
			success: function (data) {
				alertify.success(data.message);
			},
			error: function (xhr) {
				const error = xhr.responseJSON;
				alertify.error(error.message);
			},
		});
	});
});
