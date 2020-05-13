$(function () {
	// Populating the table ..
	var totalAmount = 0;
	var table = $("#cart-table").DataTable({
		paging: false,
		ordering: false,
		searching: false,
		ajax: {
			url: "http://localhost:3000/getCart",
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
			},
			dataSrc: "",
		},
		columns: [
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
				data: "price",
			},
			{
				data: "cartItem.quantity",
			},
			{
				data: "cartItem.quantity",
				render: function (data, type, row) {
					var total = data * row.price;
					return total;
				},
			},
		],
		footerCallback: function (row, data, start, end, display) {
			var api = this.api();
			for (var i = 0; i < api.data().length; i++) {
				totalAmount += api.column(2).data()[i] * api.column(3).data()[i];
			}
		},
	});

	// After table has rendered completely
	table.on("draw", function (row, data, start, end, display) {
		$("#invoice-total").text(totalAmount);
		$("#userId").val(userId);
	});

	// // Checkout Button
	// $("#checkout-btn").on("click", function (e) {
	// 	e.preventDefault();
	// 	alertify.confirm(
	// 		"Continue to the payment page?",
	// 		function () {
	// 			var data = new FormData();
	// 			data.append("total", totalAmount);
	// 			$.ajax({
	// 				url: "http://localhost:3000/checkout",
	// 				type: "post",
	// 				processData: false,
	// 				contentType: false,
	// 				data: data,
	// 				headers: {
	// 					Authorization: "bearer " + localStorage.getItem("token"),
	// 				},
	// 			});
	// 		},
	// 		function () {
	// 			alertify.error("Canceled");
	// 		}
	// 	);
	// });
});
