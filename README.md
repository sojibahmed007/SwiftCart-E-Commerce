# 🛒 SwiftCart — Modern E-Commerce Frontend

![SwiftCart Preview](./Assets/banner-image.png)

A modern, responsive, and feature-rich E-Commerce web application built with **HTML5**, **Tailwind CSS**, **DaisyUI**, and **Vanilla JavaScript (ES6+)**. SwiftCart seamlessly integrates with the [FakeStoreAPI](https://fakestoreapi.com/) to deliver a real-world shopping experience with zero external frontend framework dependencies.

---

## ✨ Key Features

- 🌓 **Dark / Light Mode**: Seamless theme toggler with auto-detection of system preference and persistent `localStorage` state.
- ⚡ **Instant Catalog Loading**: Pre-cached fallback data ensures 0ms first render without waiting for API lag, combined with non-blocking live API synchronization.
- 🔍 **Real-Time Search & Sorting**:
  - Live instantaneous search across product titles, categories, and descriptions.
  - Sorting options: Price (Low to High, High to Low), Customer Rating, and Alphabetical (A-Z).
- 🏷️ **Dynamic Category Filtering**: Filter pills for Men's Clothing, Women's Clothing, Jewelery, and Electronics with active state styling.
- 🛍️ **Slide-Over Shopping Cart Drawer (Offcanvas)**:
  - Smooth slide-in cart drawer with backdrop blur.
  - Quantity steppers (`+` / `-`), individual item removal, and subtotal calculation.
  - Dynamic shipping calculation (Free shipping over $50).
  - Built-in coupon engine with instant discount validation (try code `SWIFT20` for 20% off or `FREESHIP` for 10% off).
  - Synced with `localStorage` for cart persistence across browser refreshes.
- ❤️ **Saved Wishlist**:
  - Save favorite items with animated heart toggles.
  - Wishlist modal with one-click "Move to Cart" action.
- 👁️ **Quick View Product Modal**:
  - Powered by native HTML5 `<dialog closedby="any">` with modern light-dismiss and coordinates-based fallback.
  - High-resolution product showcase, category badges, star ratings, review counters, in-depth description, and quantity selector.
- 💳 **Express Checkout Flow**:
  - Shipping address and payment mockup form.
  - Order summary breakdown.
  - Processing simulation with confirmed Order ID generation and celebration receipt view.
- ⏱️ **Flash Deals Countdown**: Live ticking promotional timer on trending deals.
- 📱 **Fully Responsive**: Mobile-first design optimized for mobile phones, tablets, and desktop displays.
- 🔔 **Toast Notification System**: Non-intrusive floating snackbar alerts for user actions (cart additions, wishlist updates, promo codes, form submits).

---

## 🛠️ Tech Stack

- **Markup**: HTML5 (Semantic elements, `<dialog>`, `<details>`, `<summary>`)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) & [DaisyUI 4](https://daisyui.com/)
- **Icons**: [Font Awesome 6](https://fontawesome.com/)
- **Typography**: [Google Fonts (Poppins)](https://fonts.google.com/specimen/Poppins)
- **Scripting**: Vanilla JavaScript (ES6+, Async/Await, Fetch API, LocalStorage)
- **API Source**: [FakeStoreAPI](https://fakestoreapi.com/)

---

## 📂 Project Structure

```text
SwiftCart-E-Commerce/
├── Assets/
│   ├── backpack.jpg        # Product asset
│   ├── banner-image.png    # Hero showcase banner
│   ├── jackets.jpg         # Product asset
│   └── tshirt.jpg          # Product asset
├── script/
│   ├── index.js            # Main application logic & state management
│   └── products-data.js    # Pre-cached instant fallback product catalog
├── index.html              # Core single-page application structure
├── style.css               # Custom animations, scrollbar & modal styling
├── tailwind.config.js      # Tailwind configuration
└── README.md               # Documentation & assessment reference
```

---

## 🚀 Getting Started

No build step or Node.js server is required. You can run SwiftCart directly in any modern web browser:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sojibahmed007/SwiftCart-E-Commerce.git
   cd SwiftCart-E-Commerce
   ```

2. **Open `index.html`:**
   - Double-click `index.html` to open it in your browser, or
   - Use VS Code's **Live Server** extension, or
   - Start a simple local server:
     ```bash
     # Python
     python -m http.server 3000

     # Node (npx)
     npx serve .
     ```
3. Open `http://localhost:3000` in your browser.

---

## 🧪 Coupon Codes to Test

| Coupon Code | Discount | Description |
| ----------- | -------- | ----------- |
| `SWIFT20`   | **20% OFF** | 20% discount on order subtotal |
| `FREESHIP`  | **10% OFF** | 10% discount on order subtotal + free delivery |

---

## 📚 JavaScript Concepts & Assessment Reference

<details>
<summary><strong>1. Difference between null and undefined</strong></summary>

- **Undefined**: A variable has been declared but has not yet been assigned a value. It occurs automatically by default.
- **Null**: An intentional absence of any object value, explicitly assigned by the developer to signify "empty" or "no value".
</details>

<details>
<summary><strong>2. Uses of map() vs forEach()</strong></summary>

- **`map()`**: Creates and returns a new array by applying a callback function to every element of the source array without mutating the original.
- **`forEach()`**: Executes a callback function once for every element in the array for side-effects (e.g., updating DOM, logging, saving data). It returns `undefined`.
</details>

<details>
<summary><strong>3. Difference between == and ===</strong></summary>

- **`==` (Loose Equality)**: Compares two values for equality after performing implicit type coercion (converting operands to a common type).
- **`===` (Strict Equality)**: Compares both the value and the type without performing coercion; returns `true` only if both value and type match.
</details>

<details>
<summary><strong>4. Significance of async / await in fetching API data</strong></summary>

- **Readability**: Enables asynchronous code to look and read like synchronous procedural code, eliminating callback nesting and `.then()` chaining.
- **Error Handling**: Simplifies error management by allowing standard `try...catch` blocks to catch both synchronous and asynchronous errors.
- **Sequential Flow Control**: Pauses execution at `await` until the Promise settles, ensuring data is available before proceeding.
</details>

<details>
<summary><strong>5. Concept of Scope in JavaScript</strong></summary>

- **Global Scope**: Variables declared outside of any function or block, accessible anywhere in the application.
- **Function Scope**: Variables declared within a function (using `var`, `let`, or `const`), accessible only within that function's execution context.
- **Block Scope**: Variables declared with `let` or `const` inside a block `{}` (such as `if`, `for`, or `while` statements), accessible strictly within that specific block.
</details>

---

&copy; 2026 SwiftCart. Crafted with passion.
