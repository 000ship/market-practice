$(function () {
	let wrapper = $("#container");
	const url = "https://localhost:3000/paginatedProducts?page=";
	const page = new URLSearchParams(window.location.search).get("page");
	var token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
	// Populating page
	$.ajax({
		url: url + page,
		type: "get",
		success: (data) => {
			if (data.products.length > 0) {
				var container = $("<div></div>").addClass("news-container");
				for (let product of data.products) {
					var card = `
                    <div class="news-card">
                        <img class="news-card-img img-responsive" src="/${product.imageUrl}" />
                        <div class="news-card-body">
                            <div class="product-title">
                                <a href="">${product.title}</a>
                            </div>
                            <p class="news-meta">${product.content}</p>
                            <h3 class="text-center">${product.price}</h3>
							<button
								id="addCart"
                                class="btn btn-warning btn-block"
                                data-product-id="${product.id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>`;
					container.append(card);
				}

				// Paginations

				// prettier-ignore
				var pagination = `
                    <div class="text-center">
                        <ul class="pagination">
                        ${data.currentPage !== 1 && data.previousPage !== 1	? `<li><a href="?page=1">1</a></li>` : "" }
                        ${data.hasPreviousPage ? `<li><a href="?page=${data.previousPage}">${data.previousPage}</a></li>` : "" }
                        <li class="active"><a href="?page=${data.currentPage}">${data.currentPage}</a></li>
                        ${data.hasNextPage ? `<li><a href="?page=${data.nextPage}">${data.nextPage}</a></li>` : "" }
                        ${data.lastPage !== data.currentPage && data.nextPage !== data.lastPage ? `<li><a href="?page=${data.lastPage}">${data.lastPage}</a></li>` : "" }
                        </ul>
					</div>
					 `;

				wrapper.append(container);
				wrapper.append(pagination);
			} else {
				wrapper.append("<h2>No Products Found!</h2>");
			}
		},
		error: (error) => {
			console.log(error);
		},
	});

	$(document).on("click", "#addCart", function (e) {
		e.preventDefault();
		var prodId = $(this).attr("data-product-id");
		var data = new FormData();
		data.append("productId", prodId);

		// Adding product to cart
		$.ajax({
			url: "https://localhost:3000/addToCart",
			type: "post",
			processData: false,
			contentType: false,
			data: data,
			headers: {
				Authorization: "bearer " + localStorage.getItem("token"),
				"CSRF-Token": token,
			},
			success: (xhr) => {
				alertify.success("Added To Cart");
			},
			error: (xhr) => {
				const error = xhr.responseJSON;
				alertify.error(error.message);
			},
		});
	});
});
