$(function () {
	let wrapper = $("#container");
	const url = "https://localhost:3000/paginatedPosts?page=";
	const page = new URLSearchParams(window.location.search).get("page");
	// Populating page
	$.ajax({
		url: url + page,
		type: "get",
		success: (data) => {
			if (data.posts.length > 0) {
				var container = $("<div></div>").addClass("news-container");
				for (let post of data.posts) {
					var card = `
                    <div class="news-card">
                    <img class="news-card-img img-responsive" src="/${post.imageUrl}" alt="News Alt" />
                    <div class="news-card-body">
                        <a href="" class="news-title">${post.title}</a>
                        <p class="news-meta">${post.title}, ${post.createdAt}</p>
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
