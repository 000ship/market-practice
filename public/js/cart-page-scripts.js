$(function () {
	// Populating the table ..
	var totalAmount = 0;
	var table = $("#cart-table").DataTable({
		paging: false,
		ordering: false,
		searching: false,
		ajax: {
			url: "https://localhost:3000/getCart",
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
						"https://localhost:3000/" +
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
});
