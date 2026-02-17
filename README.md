1. Difference between null and undefined
Undefined means a variable has been declared but has not been given any value yet. It happens automatically.
Null means an empty value that is assigned intentionally by the programmer. It represents no value on purpose.
2. Uses of map() vs forEach()
map() creates a new array by transforming every element in an existing array using a provided function. It returns the new array and does not modify the original array.
forEach() executes a provided function once for each array element. It returns undefined and is typically used for side effects (e.g., logging, saving to database).
3. Difference between == and ===
== (Loose Equality): Checks for equality after performing type coercion (converting operands to the same type).
=== (Strict Equality): Checks for equality of both value and type without performing type coercion.
4. Significance of async / await in fetching API data
Readability: It makes asynchronous code look and behave like synchronous code, making it easier to read and understand compared to chaining .then() and .catch().
Error Handling: Allows the use of standard try...catch blocks for handling errors, which is more intuitive than .catch().
Control Flow: await pauses the execution of the function until the Promise is resolved, ensuring data is available before proceeding to the next line of code.
5. Concept of Scope in JavaScript
Global Scope: Variables declared outside of any function or block. They are accessible from anywhere in the code.
Function Scope: Variables declared inside a function (using var, let, or const) are accessible only within that function.
Block Scope: Variables declared inside a block {} (e.g., inside if, for, or while loops) using let or const are accessible only within that block. var is not block-scoped.

