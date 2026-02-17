// Click product button show product page
const productButtons = document.querySelectorAll(".products-btn");
const homeButtons = document.querySelectorAll(".home-btn");
const homePage = document.getElementById("homePage");
const productPage = document.getElementById("productPage");
// navigate one page to another page
productButtons.forEach(btn => btn.addEventListener("click", () => {
    productPage.classList.remove("hidden");
    homePage.classList.add("hidden");
}));

homeButtons.forEach(btn => btn.addEventListener("click", () => {
    homePage.classList.remove("hidden");
    productPage.classList.add("hidden");
}));
// product button 
//https://fakestoreapi.com/products/categories
const loadCategories = async () => {
    const res = await fetch("https://fakestoreapi.com/products/categories");
    const data = await res.json();
    displayCategories(data);
}
const displayCategories = (data) => {

    const productBtn = document.getElementById("product_btn");

    data.forEach(category => {

        const btn = document.createElement("button");
        btn.classList.add("btn", "btn-primary", "hover:bg-[#6366f1]", "hover:text-white", "btn-info", "rounded-full");
        btn.innerText = category;

        btn.addEventListener("click", async () => {
            const res = await fetch(`https://fakestoreapi.com/products/category/${category}`);
            const data = await res.json();
            displayProducts(data);
        });

        productBtn.appendChild(btn);
    });
}
//get all product  
//https://fakestoreapi.com/products
//clicked all button
const loadAllProducts = async () => {
    const res = await fetch("https://fakestoreapi.com/products");
    const data = await res.json();
    displayProducts(data);
}
displayProducts = (data) => {

    const productContainer = document.getElementById("productContainer");
    productContainer.innerHTML = "";

    data.forEach(product => {
        const productCard = document.createElement("div");
        productCard.innerHTML = `
        <div class="card bg-base-100 shadow-sm hover:shadow-md border border-gray-100">
                        <figure class="px-4 pt-4 bg-[#F3F4F6] h-64 flex items-center justify-center">
                            <img src="${product.image}" alt="${product.title}"
                                class="object-contain h-full w-full mix-blend-multiply" />
                        </figure>
                        <div class="card-body p-4 text-left">
                            <div class="flex justify-between items-center mb-2">
                                <span
                                    class="badge badge-ghost text-xs font-medium text-blue-600 bg-blue-50 border-none px-2 py-1">${product.category}</span>
                                <div class="flex items-center gap-1 text-xs text-gray-500">
                                    <i class="fa-solid fa-star text-yellow-400"></i>
                                    <span>${product.rating.rate} (${product.rating.count})</span>
                                </div>
                            </div>
                            <h3 class="card-title text-base font-bold mb-1">${product.title}</h3>
                            <p class="text-xl font-bold text-gray-800 mb-4">${product.price}</p>
                            <div class="card-actions justify-between items-center grid grid-cols-2 gap-3">
                                <button onclick="loadProductDetails(${product.id})"
                                    class="btn btn-outline btn-sm w-full border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 font-normal"><i
                                        class="fa-regular fa-eye"></i> Details</button>
                                <button
                                    class="btn btn-primary btn-sm w-full bg-[#6366f1] hover:bg-[#4f46e5] border-none text-white font-normal"><i
                                        class="fa-solid fa-cart-plus"></i> Add</button>
                            </div>
                        </div>
                    </div>
        `;
        productContainer.appendChild(productCard);
    });
}
//using modal 
//https://fakestoreapi.com/products/{id}
// Modal on "Details" Click Clicking the "Details" button on a card opens a modal with full product details:
//Full Title
//Full Description
//Price & Rating
//"Buy Now" or "Add to Cart" button in modal.
const loadProductDetails = async (id) => {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    const data = await res.json();
    displayProductDetails(data);
}
const displayProductDetails = (data) => {
    const productDetails = document.getElementById("product_detail");
    productDetails.innerHTML = `
    <div class="card bg-base-100 shadow-sm hover:shadow-md border border-gray-100">
        <figure class="px-4 pt-4 bg-[#F3F4F6] h-64 flex items-center justify-center">
            <img src="${data.image}" alt="${data.title}"
                class="object-contain h-full w-full mix-blend-multiply" />
        </figure>
        <div class="card-body p-4 text-left">
            <div class="flex justify-between items-center mb-2">
                <span class="badge badge-ghost text-xs font-medium text-blue-600 bg-blue-50 border-none px-2 py-1">${data.category}</span>
                <div class="flex items-center gap-1 text-xs text-gray-500">
                    <i class="fa-solid fa-star text-yellow-400"></i>
                    <span>${data.rating.rate} (${data.rating.count})</span>
                </div>
            </div>
            <h3 class="card-title text-base font-bold mb-1">${data.title}</h3>
            <p class="text-sm text-gray-500 mb-2">${data.description}</p>
            <p class="text-xl font-bold text-gray-800 mb-4">$${data.price}</p>
            <div class="card-actions justify-end">
                <button class="btn btn-primary btn-sm bg-[#6366f1] hover:bg-[#4f46e5] border-none text-white font-normal"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
            </div>
        </div>
    </div>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
    `;
    document.getElementById("my_modal_5").showModal();
}


loadAllProducts();
loadCategories();
