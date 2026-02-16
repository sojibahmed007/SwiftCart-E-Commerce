// Click product button show product page
const productButtons = document.querySelectorAll(".products-btn");
const homeButtons = document.querySelectorAll(".home-btn");
const homePage = document.getElementById("homePage");
const productPage = document.getElementById("productPage");
//navigate one page to another page
// navigate one page to another page
productButtons.forEach(btn => btn.addEventListener("click", () => {
    productPage.classList.remove("hidden");
    homePage.classList.add("hidden");
}));

homeButtons.forEach(btn => btn.addEventListener("click", () => {
    homePage.classList.remove("hidden");
    productPage.classList.add("hidden");
}));
