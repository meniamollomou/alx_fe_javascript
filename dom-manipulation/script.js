// Initialize with some default quotes
let quotes = [];

// Get DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// ✅ Function to display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available. Please add one!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `"${quote.text}" — <em>${quote.category}</em>`;
}

// ✅ Function to add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// ✅ Function to create the quote addition form dynamically
function createAddQuoteForm() {
  const formSection = document.createElement("div");

  const heading = document.createElement("h2");
  heading.textContent = "Add Your Own Quote";

  const inputQuote = document.createElement("input");
  inputQuote.id = "newQuoteText";
  inputQuote.type = "text";
  inputQuote.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formSection.appendChild(heading);
  formSection.appendChild(inputQuote);
  formSection.appendChild(inputCategory);
  formSection.appendChild(addButton);

  document.body.appendChild(formSection);
}

// ✅ Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

// ✅ Create form on load
createAddQuoteForm();
